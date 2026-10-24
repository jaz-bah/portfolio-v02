import { ParallaxHeroImages } from "../animations/parallaxHeroImages";

const images = [
    "/static/projects/offculture-tab.webp",
    "/static/shopify/unlisted (1).webp",
    "/static/shopify/alma (2).webp",
    "/static/projects/promptarc-pc.webp",
    "/static/shopify/unconventional (1).webp",
    "/static/shopify/glaseyewear (2).webp",
];

export function Experiences() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
            <ParallaxHeroImages images={images} variant="edge-focus" />
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-neutral-800 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] md:text-6xl dark:text-neutral-100 dark:drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                Ideas turned into interactive experiences.
                </h1>
                <p className="max-w-md text-neutral-600 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] dark:text-neutral-400 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
                From Shopify storefronts to web apps and browser extensions. I build digital products with custom interactions, smooth animations, and attention to detail.
                </p>
            </div>
        </div>
    );
}
