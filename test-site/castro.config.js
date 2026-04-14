import { castroJsx } from "@vktrz/castro-jsx";
import { castroSolid } from "@vktrz/castro-solid";

export default {
	plugins: [castroJsx(), castroSolid()],
	messages: "serious",
	importMap: {
		"custom-lib": "https://esm.sh/custom-lib",
		"@preact/signals": "https://esm.sh/@preact/signals?external=preact",
	},
	markdown: {
		options: { headings: true, tables: true, tasklists: true },
	},
};
