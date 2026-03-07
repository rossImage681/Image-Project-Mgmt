import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // IMC Brand Colors
                background: "var(--color-bg)",
                surface: "var(--color-surface)",
                "surface-raised": "var(--color-surface-raised)",
                "input-bg": "var(--color-input-bg)",
                "pale-pink": "#F69BC9",
                "deep-purple": "#371d34",
                "fuchsia": "#E52E7D",
                "bubblegum": "#EB609D",
                "poppy-red": "#E40224",
                "orange": "#FF4A29",

                // Text & Neutrals
                "text-primary": "var(--color-text)",
                "text-secondary": "var(--color-text-secondary)",
                "border-light": "var(--color-border-light)",
                "border-medium": "var(--color-border-medium)",

                // Status Colors
                "status-planned": "#94A3B8",
                "status-progress": "#3B82F6",
                "status-blocked": "#EF4444",
                "status-complete": "#22C55E",
            },
            fontFamily: {
                // Chelon for headings - fallbacks for when font files aren't loaded
                heading: [
                    "Menken STD Head",
                    "Chelon",
                    "Georgia",
                    "Cambria",
                    "Times New Roman",
                    "serif",
                ],
                // Arimo for body/UI text
                body: ["Arimo", "Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                "expand-in": "expand-in 0.3s ease-out",
                "drawer-slide": "drawer-slide 0.3s ease-out",
                "fade-in": "fade-in 0.2s ease-out",
            },
            keyframes: {
                "expand-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                "drawer-slide": {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
