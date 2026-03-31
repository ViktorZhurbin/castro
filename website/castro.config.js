import { tailwind } from "@vktrz/castro-tailwind";

export default {
	plugins: [tailwind({ input: "styles/app.css" })],
	port: 3000,
	messages: "satirical",
};
