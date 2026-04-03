import { castroJsx } from "@vktrz/castro-jsx";
import { tailwind } from "@vktrz/castro-tailwind";

export default {
	plugins: [castroJsx(), tailwind({ input: "styles/app.css" })],
	port: 3000,
	messages: "satirical",
};
