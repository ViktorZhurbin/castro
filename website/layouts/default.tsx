import { Footer } from "@components/Footer.tsx";
import { PageShell } from "@components/PageShell.tsx";
import type { ComponentChildren } from "preact";

interface Props {
	title: string;
	children: ComponentChildren;
}

export default function DefaultLayout(props: Props) {
	const { title, children } = props;

	return (
		<PageShell title={title}>
			<main class="flex flex-col flex-1 overflow-y-auto">
				{children}

				<Footer />
			</main>
		</PageShell>
	);
}
