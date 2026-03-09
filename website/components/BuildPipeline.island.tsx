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
 * The factory and gear are inline SVGs in a constructivist industrial style.
 * All text is editable HTML. Conveyors and motion are pure CSS.
 */

/** Rotation angles for the 12 gear teeth */
const TEETH = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

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

			{/* Factory — constructivist industrial silhouette */}
			<div class="bp-factory">
				<svg viewBox="0 0 100 140" class="bp-factory-svg" aria-hidden="true">
					{/* Smokestacks with caps */}
					<rect x="12" y="0" width="9" height="42" />
					<rect x="9" y="0" width="15" height="4" />
					<rect x="30" y="15" width="7" height="27" />
					<rect x="27" y="15" width="13" height="3" />
					<rect x="72" y="6" width="10" height="36" />
					<rect x="68" y="6" width="18" height="4" />

					{/* Sawtooth roof */}
					<polygon points="0,52 12,42 24,52 36,42 48,52 60,42 72,52 84,42 100,52" />

					{/* Main body */}
					<rect x="0" y="52" width="100" height="78" />

					{/* Windows — subtle lighter rectangles */}
					<rect x="10" y="64" width="14" height="10" rx="1" class="bp-window" />
					<rect x="30" y="64" width="14" height="10" rx="1" class="bp-window" />
					<rect x="56" y="64" width="14" height="10" rx="1" class="bp-window" />
					<rect x="76" y="64" width="14" height="10" rx="1" class="bp-window" />

					{/* Foundation */}
					<rect x="-4" y="128" width="108" height="12" />
				</svg>

				{/* Smoke puffs — CSS-animated above the stacks */}
				<div class="bp-smoke bp-smoke-1" />
				<div class="bp-smoke bp-smoke-2" />
				<div class="bp-smoke bp-smoke-3" />

				<span class="bp-factory-label">BUN.BUILD</span>
				<span class="bp-factory-sub">compile + split</span>
			</div>

			{/* Gear — toothed cog at the input conveyor / factory junction */}
			<svg viewBox="0 0 100 100" class="bp-gear" aria-hidden="true">
				{TEETH.map((angle) => (
					<rect
						x="42"
						y="4"
						width="16"
						height="18"
						rx="1"
						transform={`rotate(${angle} 50 50)`}
					/>
				))}
				<circle cx="50" cy="50" r="33" />
				<circle
					cx="50"
					cy="50"
					r="18"
					fill="none"
					stroke-width="3"
					class="bp-gear-ring"
				/>
				<circle cx="50" cy="50" r="6" class="bp-gear-axle" />
			</svg>

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
				class="btn btn-primary bp-replay"
				onClick={replay}
				disabled={state === "active"}
			>
				Replay
			</button>
		</div>
	);
}
