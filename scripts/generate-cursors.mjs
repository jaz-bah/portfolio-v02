/**
 * Converts Windows animated cursors (.ani) into sprite sheets + JSON metadata
 * that the browser can actually render.
 *
 * Source:  public/static/cursor/*.ani
 * Output:  public/static/cursor/generated/*.png
 *          components/cursor/cursors.json
 *
 * Run: npm run cursors
 *
 * ANI = RIFF container ("ACON") with:
 *   anih  -> header (frame count, step count, default rate, ...)
 *   rate  -> per-step duration in jiffies (1/60s)
 *   seq   -> per-step frame index
 *   LIST "fram" -> "icon" chunks, each one a .cur / .ico file
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "public/static/cursor");
const OUTPUT_DIR = path.join(SOURCE_DIR, "generated");
const META_FILE = path.join(ROOT, "components/cursor/cursors.json");

/** States that should keep animating forever (they have no long rest frame). */
const LOOPING = new Set(["normal", "link", "busy", "working", "precision"]);

const SLUGS = {
  "Normal Select": "normal",
  "Link Select": "link",
  "Text Select": "text",
  "Busy": "busy",
  "Working In Background": "working",
  "Unavailable": "unavailable",
  "Help Select": "help",
  "Precision Select": "precision",
  "Move": "move",
  "Person Select": "person",
  "Location Select": "location",
  "Handwriting": "handwriting",
  "Alternate Select": "alternate",
  "Horizontal Resize": "resize-h",
  "Vertical Resize": "resize-v",
  "Diagonal Resize 1": "resize-d1",
  "Diagonal Resize 2": "resize-d2",
};

function readRiffChunks(buffer) {
  const chunks = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    chunks.push({ id, size, dataOffset });

    offset = dataOffset + size + (size % 2);
  }

  return chunks;
}

function parseAni(buffer) {
  const chunks = readRiffChunks(buffer);

  const anihChunk = chunks.find((chunk) => chunk.id === "anih");
  if (!anihChunk) throw new Error("Missing anih chunk");

  const a = anihChunk.dataOffset;
  const header = {
    frames: buffer.readUInt32LE(a + 4),
    steps: buffer.readUInt32LE(a + 8),
    width: buffer.readUInt32LE(a + 12),
    height: buffer.readUInt32LE(a + 16),
    bits: buffer.readUInt32LE(a + 20),
    planes: buffer.readUInt32LE(a + 24),
    rate: buffer.readUInt32LE(a + 28),
    flags: buffer.readUInt32LE(a + 32),
  };

  const readUInt32Array = (chunk) => {
    const count = Math.floor(chunk.size / 4);
    return Array.from({ length: count }, (_, i) =>
      buffer.readUInt32LE(chunk.dataOffset + i * 4),
    );
  };

  const rateChunk = chunks.find((chunk) => chunk.id === "rate");
  const seqChunk = chunks.find((chunk) => chunk.id === "seq ");

  const rates = rateChunk ? readUInt32Array(rateChunk) : null;
  const sequence = seqChunk ? readUInt32Array(seqChunk) : null;

  const framChunk = chunks.find(
    (chunk) =>
      chunk.id === "LIST" &&
      buffer.toString("ascii", chunk.dataOffset, chunk.dataOffset + 4) ===
        "fram",
  );
  if (!framChunk) throw new Error("Missing LIST/fram chunk");

  const frames = [];
  let offset = framChunk.dataOffset + 4;
  const framEnd = framChunk.dataOffset + framChunk.size;

  while (offset + 8 <= framEnd) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (id === "icon") {
      frames.push(buffer.subarray(dataOffset, dataOffset + size));
    }

    offset = dataOffset + size + (size % 2);
  }

  return { header, rates, sequence, frames };
}

/**
 * Decode a .cur / .ico file into raw RGBA pixels + hotspot.
 * Handles both PNG-compressed entries (Vista+) and classic BMP/DIB entries.
 */
async function decodeIcon(iconBuffer) {
  const reserved = iconBuffer.readUInt16LE(0);
  const type = iconBuffer.readUInt16LE(2); // 1 = icon, 2 = cursor
  const count = iconBuffer.readUInt16LE(4);

  if (reserved !== 0 || (type !== 1 && type !== 2) || count < 1) {
    throw new Error("Invalid ICO/CUR header");
  }

  let best = null;

  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16;
    const width = iconBuffer[entry] === 0 ? 256 : iconBuffer[entry];
    const height = iconBuffer[entry + 1] === 0 ? 256 : iconBuffer[entry + 1];
    const hotspotX = iconBuffer.readUInt16LE(entry + 4);
    const hotspotY = iconBuffer.readUInt16LE(entry + 6);
    const bytes = iconBuffer.readUInt32LE(entry + 8);
    const imageOffset = iconBuffer.readUInt32LE(entry + 12);

    const candidate = {
      width,
      height,
      hotspotX: type === 2 ? hotspotX : 0,
      hotspotY: type === 2 ? hotspotY : 0,
      bytes,
      imageOffset,
    };

    if (!best || candidate.width * candidate.height > best.width * best.height) {
      best = candidate;
    }
  }

  const image = iconBuffer.subarray(best.imageOffset, best.imageOffset + best.bytes);

  // PNG-compressed entry: hand it straight to sharp.
  if (image.readUInt32BE(0) === 0x89504e47) {
    const { data, info } = await sharp(image)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return {
      width: info.width,
      height: info.height,
      hotspotX: best.hotspotX,
      hotspotY: best.hotspotY,
      rgba: data,
    };
  }

  // Classic DIB: BITMAPINFOHEADER + bottom-up BGRA pixels + 1bpp AND mask.
  const headerSize = image.readUInt32LE(0);
  const width = image.readInt32LE(4);
  const rawHeight = image.readInt32LE(8);
  const planes = image.readUInt16LE(12);
  const bitCount = image.readUInt16LE(14);
  const compression = image.readUInt32LE(16);

  if (planes !== 1 || compression !== 0 || bitCount !== 32) {
    throw new Error(`Unsupported cursor bitmap (${bitCount}bpp, compression ${compression})`);
  }

  const topDown = rawHeight < 0;
  const height = Math.abs(rawHeight) / 2; // doubled for the AND mask
  const pixelOffset = headerSize;
  const stride = width * 4;

  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const sourceRow = topDown ? y : height - 1 - y;
    const sourceStart = pixelOffset + sourceRow * stride;
    const destStart = y * stride;

    for (let x = 0; x < width; x++) {
      const s = sourceStart + x * 4;
      const d = destStart + x * 4;
      const alpha = image[s + 3];

      if (alpha === 0) {
        // fully transparent; leave the buffer zeroed
        continue;
      }

      // BGRA -> RGBA
      rgba[d] = image[s + 2];
      rgba[d + 1] = image[s + 1];
      rgba[d + 2] = image[s];
      rgba[d + 3] = alpha;
    }
  }

  return {
    width,
    height,
    hotspotX: best.hotspotX,
    hotspotY: best.hotspotY,
    rgba,
  };
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Cursor source folder not found: ${SOURCE_DIR}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(META_FILE), { recursive: true });

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => file.toLowerCase().endsWith(".ani"));

  const metadata = {};

  for (const file of files) {
    const label = file
      .replace(/\s*v[\d.]+\.ani$/i, "")
      .replace(/^\[SB\]\s*/i, "")
      .trim();

    const slug = SLUGS[label];
    if (!slug) {
      console.warn(`Skipping unknown cursor: ${file}`);
      continue;
    }

    const buffer = fs.readFileSync(path.join(SOURCE_DIR, file));
    const { header, rates, sequence, frames } = parseAni(buffer);

    if (!frames.length) {
      console.warn(`No frames found in ${file}`);
      continue;
    }

    // Decode every source frame once, dedupe identical ones.
    const allFrames = [];
    const decoded = [];
    const seen = new Map();

    for (const frameBuffer of frames) {
      const frame = await decodeIcon(frameBuffer);
      allFrames.push(frame);

      const hash = crypto.createHash("md5").update(frame.rgba).digest("hex");

      if (!seen.has(hash)) {
        seen.set(hash, decoded.length);
        decoded.push(frame);
      }
    }

    const { width, height } = decoded[0];

    if (decoded.some((frame) => frame.width !== width || frame.height !== height)) {
      throw new Error(`Frames of ${file} have inconsistent sizes`);
    }

    const stepCount = header.steps || frames.length;
    const loop = LOOPING.has(slug);

    const steps = [];

    for (let step = 0; step < stepCount; step++) {
      const frameIndex = sequence ? sequence[step] : step;
      const frame = allFrames[frameIndex];
      if (!frame) continue;

      const pixelHash = crypto.createHash("md5").update(frame.rgba).digest("hex");
      const uniqueIndex = seen.get(pixelHash) ?? 0;

      const jiffies = rates?.[step] ?? header.rate;
      let duration = Math.max(16, Math.round((jiffies * 1000) / 60));

      // Non-looping cursors rest on their final frame forever. Cap that hold
      // so the timeline does not stay alive for minutes.
      if (!loop && step === stepCount - 1) duration = 1000;

      steps.push([uniqueIndex, duration]);
    }

    const sheetWidth = decoded.length * width;
    const sheet = Buffer.alloc(sheetWidth * height * 4);

    decoded.forEach((frame, index) => {
      for (let y = 0; y < height; y++) {
        const sourceStart = y * width * 4;
        const destStart = (y * sheetWidth + index * width) * 4;
        frame.rgba.copy(sheet, destStart, sourceStart, sourceStart + width * 4);
      }
    });

    const imageFile = `${slug}.png`;
    await sharp(sheet, {
      raw: { width: sheetWidth, height, channels: 4 },
    })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(path.join(OUTPUT_DIR, imageFile));

    metadata[slug] = {
      label,
      image: `/static/cursor/generated/${imageFile}`,
      width,
      height,
      hotspot: [decoded[0].hotspotX, decoded[0].hotspotY],
      loop,
      steps,
    };

    console.log(
      `${label.padEnd(24)} ${String(decoded.length).padStart(2)} frames ` +
        `(${steps.length} steps) ${width}x${height} @ ${decoded[0].hotspotX},${decoded[0].hotspotY}` +
        ` -> ${imageFile}${loop ? " [loop]" : ""}`,
    );
  }

  fs.writeFileSync(META_FILE, `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`\nWrote ${Object.keys(metadata).length} cursors to ${META_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
