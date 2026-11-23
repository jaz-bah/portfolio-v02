export interface IFeaturedProject {
    title: string;
    description: string;
    tags: string[];
    image: string;
    live_url?: string;
    git_url?: string;
}

export const featuredProjects: IFeaturedProject[] = [
    {
        title: "Codebot",
        tags: ["SASS", "Next.js", "Nest.js", "PostgreSQL", "TypeScript", "TanStack"],
        image: "/static/projects/codebot-pc.webp",
        description:`Codebot is the workspace for what you write and reuse: notes, todos, files, components, presets, experts, tools and snippets — all stored server-side and searchable in a single box.`,
        live_url: "https://codebotapp.onrender.com/",
    },
    {
        title: "Offculture",
        description: `I pushed Shopify beyond the usual theme setup with custom Liquid, JavaScript, Custom Elements, and GSAP, building the interactions and animations from scratch to make the storefront feel more alive and responsive.
Alongside the core Shopify experience, I built custom features like a bundle builder, wishlist system, and passport-based discount flow, with custom logic connecting everything together. The goal was to keep the flexibility of Shopify while adding the kind of functionality you normally wouldn’t get from a standard theme.
`,
        tags: ["E-commerce", "Shopify", "Liquid", "Custom Elements", "GSAP"],
        image: "/static/projects/offculture-tab.webp",
        live_url: "https://www.offculturee.com",
    },
    {
        title: "Prompt Architects",
        description:`It is a web app and browser extension built to make working with AI prompts easier, faster, and more organized. The core idea is simple: enhance your prompts, save your useful ones, and keep your prompt history accessible wherever you work.
It comes as both a web application and a browser extension, giving you a dedicated space to manage your prompts while also bringing the same workflow directly into your browser.`,
        tags: ["SASS", "Next.js", "WXT", "PostgreSQL", "TypeScript", "TanStack"],
        image: "/static/projects/promptarc-pc.webp",
        live_url: "https://prompt-architects.com/",
    },
    {
        title: "AiEmaily",
        description:`AI-powered mail manager built to make handling emails faster and less overwhelming. It helps you understand your emails, generate replies, stay on top of important messages, and keep your inbox organized from one place.`,
        tags: ["SASS", "Next.js", "PostgreSQL", "TypeScript", "TanStack"],
        image: "/static/projects/aiemaily-pc.webp",
        live_url: "https://aiemaily.com/",
    },
]