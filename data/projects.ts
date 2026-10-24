export interface IProject {
  id: number;
  title: string;
  tags: string[];
  desk_image: string;
  mobile_image: string;
  description: string;
  view_link?: string;
  code_link?: string;
}

export const projects: IProject[] = [
    {
        id: 1,
        title: "OffCulture",
        tags: ["E-commerce", "Shopify", "Liquid", "Custom Elements", "GSAP"],
        desk_image: "/static/projects/offculture-pc.webp",
        mobile_image: "/static/projects/offculture-mobl.webp",
        description: `I pushed Shopify beyond the usual theme setup with custom Liquid, JavaScript, Custom Elements, and GSAP, building the interactions and animations from scratch to make the storefront feel more alive and responsive.
Alongside the core Shopify experience, I built custom features like a bundle builder, wishlist system, and passport-based discount flow, with custom logic connecting everything together. The goal was to keep the flexibility of Shopify while adding the kind of functionality you normally wouldn’t get from a standard theme.`,
        view_link: "https://www.offculturee.com",
    },
    {
        id: 2,
        title: "Prompt Architects",
        tags: ["SASS", "Next.js", "WXT", "PostgreSQL", "TypeScript", "TanStack"],
        desk_image: "/static/projects/promptarc-pc.webp",
        mobile_image: "/static/projects/promptarc-mobl.webp",
        description:`It is a web app and browser extension built to make working with AI prompts easier, faster, and more organized. The core idea is simple: enhance your prompts, save your useful ones, and keep your prompt history accessible wherever you work.
It comes as both a web application and a browser extension, giving you a dedicated space to manage your prompts while also bringing the same workflow directly into your browser.`,
        view_link: "https://prompt-architects.com/",
    },
    {
        id: 3,
        title: "AiEmaily",
        tags: ["SASS", "Next.js", "PostgreSQL", "TypeScript", "TanStack"],
        desk_image: "/static/projects/aiemaily-pc.webp",
        mobile_image: "/static/projects/aiemaily-mobl.webp",
        description:`AI-powered mail manager built to make handling emails faster and less overwhelming. It helps you understand your emails, generate replies, stay on top of important messages, and keep your inbox organized from one place.`,
        view_link: "https://aiemaily.com/",
    },
    {
        id: 4,
        title: "Agenci_",
        tags: ["Themeforest", "Gsap", "Html & Scss", "Animation"],
        desk_image: "/static/projects/agenci-pc.webp",
        mobile_image: "/static/projects/agenci-mobl.webp",
        description:`A bold, motion-driven agency template built to ThemeForest standards. Crafted with modern layouts, expressive typography, and smooth GSAP animations, it turns every scroll and interaction into part of the experience.`,
        view_link: "https://jaz-bah.github.io/agenci/index-5.html",
        code_link: "https://github.com/jaz-bah/agenci",
    },
    {
        id: 5,
        title: "Pointer",
        tags: ["E-commerce", "Template", "Html & css"],
        desk_image: "/static/projects/luxery-pc.webp",
        mobile_image: "/static/projects/luxery-mobl.webp",
        description:`A refined fashion e-commerce design built around bold visuals, elegant typography, and spacious layouts. Clean product presentation, subtle interactions, and a premium visual language create a polished shopping experience with a high-fashion feel.`,
        view_link: "https://jaz-bah.github.io/luxury-fashion/",
        code_link: "https://github.com/jaz-bah/luxury-fashion",
    },
    {
        id: 6,
        title: "INOVA",
        tags: ["E-commerce", "Template", "Html & css"],
        desk_image: "/static/projects/inova-pc.webp",
        mobile_image: "/static/projects/inova-mobl.webp",
        description:`A clean, modern furniture e-commerce homepage built around strong product visuals, spacious layouts, and refined typography. Minimal interactions and balanced composition give the design a warm, premium feel while keeping the products front and center.`,
        view_link: "https://jaz-bah.github.io/inova/",
        code_link: "https://github.com/jaz-bah/inova",
    },
    {
        id: 7,
        title: "UNDG",
        tags: ["Landing", "Gsap", "Html & Scss", "Animation"],
        desk_image: "/static/projects/undg-pc.webp",
        mobile_image: "/static/projects/undg-mobl.webp",
        description:`A bold, high-energy landing page designed to put the bicycle front and center. Dynamic visuals, smooth transitions, and engaging animations create a fast-moving experience that feels as exciting as the ride itself.`,
        view_link: "https://jaz-bah.github.io/undg/",
        code_link: "https://github.com/jaz-bah/undg",
    },
    {
        id: 8,
        title: "Animation Presets",
        tags: ["Gsap", "Html & Scss", "Animation"],
        desk_image: "/static/projects/animation-presets-pc.webp",
        mobile_image: "/static/projects/animation-presets-mobl.webp",
        description:`A collection of ready-to-use animation presets designed for quick implementation. Browse, preview, copy, and drop animations straight into your project, with lightweight snippets shared through GitHub Gists.`,
        view_link: "https://jaz-bah.github.io/gsap-animation/",
        code_link: "https://github.com/jaz-bah/gsap-animation",
    }
];