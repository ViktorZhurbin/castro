import { Footer } from "@components/Footer";
import { PageShell } from "@components/PageShell";
import type { ComponentChildren } from "preact";
import "./default.css";

interface Props {
	title: string;
	children: ComponentChildren;
}

export default function DefaultLayout(props: Props) {
	const { title, children } = props;

	return (
		<PageShell title={title}>
			<main class="default-main">
				{children}

				<Footer />
			</main>
		</PageShell>
	);
}
