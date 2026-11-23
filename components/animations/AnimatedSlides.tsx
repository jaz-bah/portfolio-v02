"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

import { IFeaturedProject } from "@/data/featured-projects";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../others/Button";
import { TextAnimate } from "./TextAnimate";

const seededRotation = (index: number, variant: number): number => {
  const seed = index * 31 + variant * 17 + 7;
  const positive = Math.abs(Math.sin(seed) * 10000) % 21;
  return Math.floor(positive) - 10;
};

export const AnimatedSlides = ({
  slides,
  autoplay = false,
}: {
  slides: IFeaturedProject[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  const cardRotations = useMemo(() => {
    return slides.map((_, index) => ({
      initial: seededRotation(index, 0),
      idle: seededRotation(index, 1),
      exit: seededRotation(index, 2),
    }));
  }, [slides]);

  return (
    <div className="w-full font-sans antialiased">
      <div className="relative grid grid-cols-1 gap-10 md:gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-60 md:h-120 w-full">
            <AnimatePresence>
              {slides.map((slide, index) => {
                const rotations = cardRotations[index];
                return (
                  <motion.div
                    key={slide.image}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      z: -100,
                      rotate: rotations.initial,
                    }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.7,
                      scale: isActive(index) ? 1 : 0.95,
                      z: isActive(index) ? 0 : -100,
                      rotate: isActive(index) ? 0 : rotations.idle,
                      zIndex: isActive(index) ? 40 : slides.length + 2 - index,
                      y: isActive(index) ? [0, -80, 0] : 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      z: 100,
                      rotate: rotations.exit,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 origin-bottom"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover object-center"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {slides[active].title}
            </h3>
            <div className="text-sm text-gray-500 dark:text-neutral-500 my-2">
              <TextAnimate animation="blurIn">
                {slides[active].description}
              </TextAnimate>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {slides[active].tags.map((tag) => (
                <span key={tag} className="inline-block px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            {slides[active].live_url && (
              <Button className="mt-5 md:mt-10" url={slides[active].live_url} type="Link" target="_blank">View Project</Button>
            )}
          </motion.div>
          <div className="flex items-center gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
            </button>

            <div
              className="ml-2 flex items-center gap-1 text-sm tabular-nums text-gray-500 dark:text-neutral-500"
              aria-live="polite"
            >
              <span className="relative inline-block h-5 w-[2ch] overflow-hidden text-right">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 text-black dark:text-white"
                  >
                    {String(active + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>/</span>
              <span>{String(slides.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};