import { DocsSidebar } from "@components/DocsSidebar.tsx";
import { Footer } from "@components/Footer.tsx";
import { PageShell } from "@components/PageShell.tsx";
import type { ComponentChildren } from "preact";
import "./docs.css";

export interface DocsLayoutProps {
	title: string;
	path?: string;
	children: ComponentChildren;
}

export default function DocsLayout({ title, path, children }: DocsLayoutProps) {
	return (
		<PageShell title={title} activePath={path}>
			<div class="docs-shell">
				<DocsSidebar activePath={path} />

				<div class="docs-content">
					<main>{children}</main>
					<Footer />
				</div>
			</div>
		</PageShell>
	);
}
