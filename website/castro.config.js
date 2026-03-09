import { tailwind } from "@vktrz/castro-tailwind";

export default {
	plugins: [tailwind({ input: "styles/app.css" })],
	port: 3000,
	messages: "satirical",
	framework: "preact",
	importMap: {
		gsap: "https://cdn.jsdelivr.net/npm/gsap@3.14.1/index.js",
		"gsap/ScrollTrigger":
			"https://cdn.jsdelivr.net/npm/gsap@3.14.1/ScrollTrigger.js",
	},
};
