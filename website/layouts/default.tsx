import { Footer } from "@components/Footer.tsx";
import { PageShell } from "@components/PageShell.tsx";
import type { VNode } from "preact";

interface Props {
	title: string;
	children: VNode;
}

const DefaultLayout = (props: Props) => {
	const { title, children } = props;

	return (
		<PageShell title={title}>
			<main class="flex flex-col flex-1 overflow-y-auto">
				{children}

				<Footer />
			</main>
		</PageShell>
	);
};

export default DefaultLayout;
