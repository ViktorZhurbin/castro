import { castroJsx } from "@vktrz/castro-jsx";

export default {
	plugins: [castroJsx()],
	messages: "serious",
	importMap: {
		"custom-lib": "https://esm.sh/custom-lib",
		"@preact/signals": "https://esm.sh/@preact/signals?external=preact",
	},
};
