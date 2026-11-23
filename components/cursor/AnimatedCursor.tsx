"use client";

import { useTheme } from "@/context/use-theme";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import cursorData from "./cursors.json";
import "./../../styles/components/cursor.scss";

export type CursorName = keyof typeof cursorData;

type CursorMeta = {
  label: string;
  image: string;
  width: number;
  height: number;
  hotspot: [number, number];
  loop: boolean;
  steps: [frame: number, duration: number][];
};

const CURSORS = cursorData as Record<CursorName, CursorMeta>;

/**
 * Friendly aliases so markup can read naturally:
 *   <a data-cursor="pointer">, <div data-cursor="drag">, ...
 */
const ALIASES: Record<string, CursorName> = {
  default: "normal",
  auto: "normal",
  pointer: "link",
  hand: "link",
  click: "link",
  loading: "busy",
  spinner: "busy",
  progress: "working",
  background: "working",
  disabled: "unavailable",
  "not-allowed": "unavailable",
  notallowed: "unavailable",
  question: "help",
  crosshair: "precision",
  drag: "move",
  pan: "move",
  profile: "person",
  avatar: "person",
  map: "location",
  pin: "location",
  pen: "handwriting",
  write: "handwriting",
  "resize-x": "resize-h",
  "resize-y": "resize-v",
  "resize-diagonal": "resize-d1",
  "resize-diagonal-alt": "resize-d2",
};

const TEXT_INPUT_TYPES = new Set([
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
  "date",
  "datetime-local",
  "month",
  "week",
  "time",
]);

const DISABLED_SELECTOR =
  ":disabled, [aria-disabled='true'], [data-disabled='true']";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "select",
  "summary",
  "label[for]",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='menuitem']",
  "[data-interactive]",
].join(", ");

const isCursorName = (value: string): value is CursorName =>
  Object.prototype.hasOwnProperty.call(CURSORS, value);

const resolveCursorName = (value: string | undefined): CursorName | null => {
  if (!value) return null;

  const key = value.trim();
  if (!key) return null;

  if (isCursorName(key)) return key;

  return ALIASES[key] ?? null;
};

function resolveCursorState(target: Element | null): CursorName {
  if (!target) return "normal";

  // 1. Explicit opt-in wins, e.g. data-cursor="person"
  const explicit = target.closest<HTMLElement>("[data-cursor]");
  if (explicit) {
    const name = resolveCursorName(explicit.dataset.cursor);
    if (name) return name;
  }

  // 2. Disabled controls
  if (target.closest(DISABLED_SELECTOR)) return "unavailable";

  // 3. Text fields and contenteditable
  const editable = target.closest<HTMLElement>(
    "input, textarea, [contenteditable]:not([contenteditable='false'])",
  );

  if (editable) {
    if (editable instanceof HTMLInputElement) {
      const type = editable.type.toLowerCase();
      if (!TEXT_INPUT_TYPES.has(type)) return "link";
    }

    return "text";
  }

  // 4. Anything clickable
  if (target.closest(INTERACTIVE_SELECTOR)) return "link";

  return "normal";
}

/**
 * Force a cursor state from anywhere in the app (e.g. while a form submits).
 * Pass `null` to release the override.
 */
export function setGlobalCursor(state: CursorName | null) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<CursorName | null>("jazbah:cursor", { detail: state }),
  );
}

export default function AnimatedCursor() {
  const { deviceType, pageLoaded, isNavigating } = useTheme();

  const [enabled, setEnabled] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);

  const refreshRef = useRef<(() => void) | null>(null);
  const manualRef = useRef<CursorName | null>(null);
  const navRef = useRef(isNavigating);
  const loadedRef = useRef(pageLoaded);

  // Only mount on desktop with a precise pointer (mouse / trackpad).
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const update = () => {
      setEnabled(deviceType === "desktop" && finePointer.matches);
    };

    update();
    finePointer.addEventListener("change", update);

    return () => finePointer.removeEventListener("change", update);
  }, [deviceType]);

  // Keep the forced-state refs in sync without rebuilding the cursor.
  useEffect(() => {
    navRef.current = isNavigating;
    loadedRef.current = pageLoaded;
    refreshRef.current?.();
  }, [isNavigating, pageLoaded]);

  useEffect(() => {
    if (!enabled) return;

    const wrapper = wrapperRef.current;
    const sprite = spriteRef.current;
    if (!wrapper || !sprite) return;

    const root = document.documentElement;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Warm the cache so switching states never flashes an empty cursor.
    const preloaded = Object.values(CURSORS).map((meta) => {
      const image = new Image();
      image.src = meta.image;
      return image;
    });

    const state = {
      name: null as CursorName | null,
      pos: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      },
      hotspot: { x: 0, y: 0 },
      visible: false,
      raf: 0,
      lastResolve: 0,
      frameTimeline: null as gsap.core.Timeline | null,
      popTween: null as gsap.core.Tween | null,
    };

    const applyPosition = () => {
      gsap.set(wrapper, {
        x: state.pos.x - state.hotspot.x,
        y: state.pos.y - state.hotspot.y,
      });
    };

    const applyState = (name: CursorName) => {
      if (name === state.name) return;

      const meta = CURSORS[name];
      if (!meta) return;

      state.name = name;
      state.hotspot.x = meta.hotspot[0];
      state.hotspot.y = meta.hotspot[1];
      wrapper.dataset.cursorState = name;

      state.frameTimeline?.kill();
      state.frameTimeline = null;

      sprite.style.width = `${meta.width}px`;
      sprite.style.height = `${meta.height}px`;
      sprite.style.backgroundImage = `url("${meta.image}")`;
      sprite.style.transformOrigin = `${meta.hotspot[0]}px ${meta.hotspot[1]}px`;

      const restingFrame = meta.steps[meta.steps.length - 1]?.[0] ?? 0;

      if (reduceMotion.matches) {
        gsap.set(sprite, {
          backgroundPosition: `${-restingFrame * meta.width}px 0px`,
        });
      } else {
        gsap.set(sprite, { backgroundPosition: "0px 0px" });

        const timeline = gsap.timeline({
          repeat: meta.loop ? -1 : 0,
        });

        let time = 0;

        for (const [frame, duration] of meta.steps) {
          timeline.set(
            sprite,
            { backgroundPosition: `${-frame * meta.width}px 0px` },
            time,
          );

          time += duration / 1000;
        }

        // The last `set` is instantaneous, so a looping cursor would skip its
        // final rest frame. A dummy tween keeps the timeline alive for it.
        const lastStep = meta.steps[meta.steps.length - 1];
        if (meta.loop && lastStep) {
          timeline.to(
            {},
            { duration: lastStep[1] / 1000 },
            time - lastStep[1] / 1000,
          );
        }

        state.frameTimeline = timeline;

        state.popTween?.kill();
        state.popTween = gsap.fromTo(
          sprite,
          { scale: 0.88 },
          { scale: 1, duration: 0.18, ease: "power2.out", overwrite: "auto" },
        );
      }

      applyPosition();
    };

    const refresh = () => {
      const forced =
        manualRef.current ??
        (navRef.current ? "working" : !loadedRef.current ? "busy" : null);

      if (forced) {
        applyState(forced);
        return;
      }

      const target = document.elementFromPoint(state.pos.x, state.pos.y);
      applyState(resolveCursorState(target));
    };

    refreshRef.current = refresh;

    const show = () => {
      if (state.visible) return;
      state.visible = true;

      // Hide the OS cursor only once we have a pointer position, so the page
      // is never left without any cursor at all.
      root.classList.add("jz_cursor-enabled");

      gsap.to(wrapper, {
        autoAlpha: 1,
        duration: reduceMotion.matches ? 0 : 0.12,
        overwrite: true,
      });
    };

    const hide = () => {
      if (!state.visible) return;
      state.visible = false;

      gsap.killTweensOf(sprite, "scale");
      gsap.set(sprite, { scale: 1 });

      gsap.to(wrapper, {
        autoAlpha: 0,
        duration: reduceMotion.matches ? 0 : 0.12,
        overwrite: true,
      });
    };

    const schedule = () => {
      if (state.raf) return;

      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        applyPosition();

        const now = performance.now();

        // Covers scroll and DOM changes under a stationary pointer.
        if (now - state.lastResolve > 90) {
          state.lastResolve = now;
          refresh();
        }
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      state.pos.x = event.clientX;
      state.pos.y = event.clientY;

      show();
      schedule();
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const forced =
        manualRef.current ??
        (navRef.current ? "working" : !loadedRef.current ? "busy" : null);

      if (forced) {
        applyState(forced);
        return;
      }

      applyState(resolveCursorState(event.target as Element | null));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      state.pos.x = event.clientX;
      state.pos.y = event.clientY;

      show();
      applyPosition();

      if (!reduceMotion.matches) {
        gsap.to(sprite, {
          scale: 0.82,
          duration: 0.1,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const onPointerUp = () => {
      if (reduceMotion.matches) return;

      gsap.to(sprite, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onWindowLeave = () => hide();
    const onWindowBlur = () => hide();
    const onScroll = () => schedule();

    const onGlobalCursor = (event: Event) => {
      const detail = (event as CustomEvent<CursorName | null>).detail;

      manualRef.current =
        detail && isCursorName(detail) ? detail : null;

      refresh();
    };

    const onReduceMotionChange = () => {
      const current = state.name;
      state.name = null;

      if (current) applyState(current);
    };

    applyState(
      manualRef.current ??
        (navRef.current ? "working" : !loadedRef.current ? "busy" : "normal"),
    );
    applyPosition();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("jazbah:cursor", onGlobalCursor);

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onWindowLeave);

    reduceMotion.addEventListener("change", onReduceMotionChange);

    return () => {
      root.classList.remove("jz_cursor-enabled");

      if (state.raf) cancelAnimationFrame(state.raf);

      state.frameTimeline?.kill();
      state.popTween?.kill();

      gsap.killTweensOf(wrapper);
      gsap.killTweensOf(sprite);

      preloaded.length = 0;

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("jazbah:cursor", onGlobalCursor);

      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("mouseleave", onWindowLeave);

      reduceMotion.removeEventListener("change", onReduceMotionChange);

      refreshRef.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={wrapperRef} className="jz_cursor" aria-hidden="true">
      <div ref={spriteRef} className="jz_cursor__sprite" />
    </div>
  );
}
