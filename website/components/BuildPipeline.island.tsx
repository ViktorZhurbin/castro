import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import "./BuildPipeline.css";

/**
 * Animated build pipeline diagram.
 *
 * Shows JSX/MD files entering a "Bun.build" factory, splitting into
 * static HTML (top conveyor) and island JS bundles (bottom conveyor).
 * Triggered by scroll — plays once when the component enters viewport.
 *
 * All text is editable HTML. The factory and conveyors are pure CSS.
 */

export default function BuildPipeline() {
	const rootRef = useRef<HTMLDivElement>(null);
	const active = useSignal(false);
	const done = useSignal(false);
	const timer = useRef(0);

	function start() {
		active.value = true;
		clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			done.value = true;
		}, 6000);
	}

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting && !active.value) start();
			},
			{ threshold: 0.4 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	function replay() {
		active.value = false;
		done.value = false;
		clearTimeout(timer.current);
		/* Two frames: first removes data-state so the browser tears down
		   running CSS animations, second re-applies it to restart them. */
		requestAnimationFrame(() => {
			requestAnimationFrame(() => start());
		});
	}

	const state = done.value ? "done" : active.value ? "active" : undefined;

	return (
		<div ref={rootRef} class="bp-root" data-state={state}>
			{/* Conveyor tracks */}
			<div class="bp-track bp-track-in" />
			<div class="bp-track bp-track-html" />
			<div class="bp-track bp-track-js" />

			{/* Factory */}
			<div class="bp-factory">
				<div class="bp-chimney bp-chimney-1" />
				<div class="bp-chimney bp-chimney-2" />
				<div class="bp-smoke bp-smoke-1" />
				<div class="bp-smoke bp-smoke-2" />
				<div class="bp-smoke bp-smoke-3" />
				<span class="bp-factory-label">BUN.BUILD</span>
				<span class="bp-factory-sub">compile + split</span>
			</div>

			{/* Gear decoration */}
			<div class="bp-gear" />

			{/* Input files */}
			<div class="badge badge-primary bp-file bp-file-in">index.tsx</div>
			<div class="badge badge-accent bp-file bp-file-in bp-file-in-2">
				Counter.island.tsx
			</div>

			{/* Output: Static HTML */}
			<span class="bp-output-label bp-output-label-html">Static HTML</span>
			<div class="badge badge-secondary bp-file bp-file-html">index.html</div>

			{/* Output: Island JS */}
			<span class="bp-output-label bp-output-label-js">Island JS</span>
			<div class="badge badge-primary bp-file bp-file-js">Counter.js</div>

			<button
				class="btn btn-secondary bp-replay"
				onClick={replay}
				disabled={state === "active"}
			>
				Replay
			</button>
		</div>
	);
}
