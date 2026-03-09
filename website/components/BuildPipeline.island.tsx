import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef } from "preact/hooks";
import "./BuildPipeline.css";

/**
 * Scroll-driven build pipeline diagram powered by GSAP.
 *
 * Shows JSX/MD files entering a "Bun.build" factory, splitting into
 * static HTML (top conveyor) and island JS bundles (bottom conveyor).
 * The animation is scrubbed by scroll position via ScrollTrigger —
 * the user controls the pace by scrolling.
 *
 * The factory and gear are inline SVGs in a constructivist industrial style.
 * All text is editable HTML. GSAP handles all motion and sequencing.
 */

gsap.registerPlugin(ScrollTrigger);

/** Rotation angles for the 12 gear teeth */
const TEETH = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export default function BuildPipeline() {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const q = gsap.utils.selector(root);

		/* svgOrigin sets the rotation pivot in the SVG's own coordinate
		   space (viewBox 0 0 100 100), so no xPercent/yPercent offset needed */
		gsap.set(q(".bp-gear"), { xPercent: -50, yPercent: -50 });

		/* Set initial states — infrastructure visible and idle,
		   files and labels hidden until GSAP animates them in. */
		gsap.set(q(".bp-file"), { autoAlpha: 0 });
		gsap.set(q(".bp-output-label"), { autoAlpha: 0 });
		gsap.set(q(".bp-smoke"), { autoAlpha: 0 });

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: root,
				start: "top 10%",
				end: "+=2000",
				scrub: 1,
				pin: true,
				anticipatePin: 1,
			},
		});

		/* ── Phase 1: Input files enter + factory processes ────────── */
		tl.addLabel("input");

		// Gear spins continuously during processing
		tl.to(
			q(".bp-gear"),
			{ rotation: 1080, duration: 4, ease: "none" },
			"input",
		);

		// Smoke puffs repeat throughout the scroll
		const smokeTl = gsap.timeline({ repeat: 1 });
		smokeTl
			.to(q(".bp-smoke"), {
				autoAlpha: 0.12,
				y: -20,
				scale: 1.3,
				stagger: 0.3,
				duration: 1,
			})
			.to(q(".bp-smoke"), {
				autoAlpha: 0,
				y: -50,
				scale: 1.8,
				duration: 1,
			});
		tl.add(smokeTl, "input");

		// Each input file slides in, pauses at factory edge, fades out
		const inputFiles = q(".bp-file-in");
		inputFiles.forEach((file: Element, i: number) => {
			const delay = i * 0.8;
			tl.fromTo(
				file,
				{ left: "-15%", autoAlpha: 0 },
				{
					left: "28%",
					autoAlpha: 1,
					duration: 1.5,
					ease: "power1.inOut",
				},
				`input+=${delay}`,
			).to(file, { autoAlpha: 0, duration: 0.4 }, `input+=${delay + 1.2}`);
		});

		/* ── Phase 3: Output files emerge on split tracks ──────────── */
		tl.addLabel("output", "input+=3");

		tl.fromTo(
			q(".bp-file-html"),
			{ right: "40%", autoAlpha: 0 },
			{ right: "2%", autoAlpha: 1, duration: 1.5, ease: "power2.out" },
			"output",
		).fromTo(
			q(".bp-file-js"),
			{ right: "40%", autoAlpha: 0 },
			{ right: "2%", autoAlpha: 1, duration: 1.5, ease: "power2.out" },
			"output+=0.3",
		);

		/* ── Phase 4: Labels fade in ───────────────────────────────── */
		tl.to(
			q(".bp-output-label-html"),
			{ autoAlpha: 0.5, duration: 0.6 },
			"output+=0.8",
		).to(
			q(".bp-output-label-js"),
			{ autoAlpha: 0.5, duration: 0.6 },
			"output+=1.0",
		);

		return () => {
			tl.kill();

			for (const trigger of ScrollTrigger.getAll()) {
				trigger.kill();
			}
		};
	}, []);

	return (
		<div ref={rootRef} class="w-full max-w-[960px] mx-auto">
			<h1 class="font-display text-5xl md:text-7xl text-primary mb-4">
				THE BUILD PIPELINE
			</h1>
			<p class="mb-6 max-w-2xl text-base-content">
				Castro compiles your pages and islands at build time. Scroll to watch
				the factory in action — source files enter, Bun.build processes them,
				and static HTML + island JS bundles emerge.
			</p>
			<div class="bp-root">
				{/* Conveyor tracks */}
				<div class="bp-track bp-track-in" />
				<div class="bp-track bp-track-html" />
				<div class="bp-track bp-track-js" />

				{/* Factory silhouette */}
				<div class="bp-factory">
					<svg viewBox="0 0 100 120" class="bp-factory-svg" aria-hidden="true">
						{/* Chimney — wider, shifted right, slight taper */}
						<polygon points="73,8 91,8 93,52 71,52" />
						{/* Left body: two right-triangle ridges — 90° at each base-left corner */}
						<polygon points="0,108 0,26 34,52 34,26 65,52 65,108" />
						{/* Right body */}
						<rect x="65" y="52" width="35" height="56" />
						{/* Windows — just below ridge base */}
						<rect x="4" y="56" width="12" height="8" rx="3" class="bp-window" />
						<rect x="37" y="56" width="12" height="8" rx="3" class="bp-window" />
						{/* Foundation */}
						<rect x="-4" y="108" width="108" height="12" />
					</svg>

					<div class="bp-smoke bp-smoke-1" />

					<span class="bp-factory-label">BUN.BUILD</span>
				</div>

				{/* Gear cog */}
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
				</svg>

				{/* Input files */}
				<div class="badge badge-primary bp-file bp-file-in">index.tsx</div>
				<div class="badge badge-accent bp-file bp-file-in">
					Counter.island.tsx
				</div>

				{/* Output: Static HTML */}
				<span class="bp-output-label bp-output-label-html">Static HTML</span>
				<div class="badge badge-secondary bp-file bp-file-html">index.html</div>

				{/* Output: Island JS */}
				<span class="bp-output-label bp-output-label-js">Island JS</span>
				<div class="badge badge-primary bp-file bp-file-js">Counter.js</div>
			</div>
		</div>
	);
}
