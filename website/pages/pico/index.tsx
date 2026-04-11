import "./index.css";

export const meta = { title: "Pico Theme Showcase - Castro" };

export default function PicoShowcase() {
	return (
		<div class="pico-root">
			<h1>Pico Theme Showcase</h1>
			<p>
				Visual reference for all Pico CSS variables and custom component
				variations.
			</p>

			<section class="pico-section">
				<h2>Color Palette</h2>
				<div class="pico-color-grid">
					<ColorSwatch name="Primary" varName="--pico-primary" />
					<ColorSwatch
						name="Primary Inverse"
						varName="--pico-primary-inverse"
					/>
					<ColorSwatch name="Secondary" varName="--pico-secondary" />
					<ColorSwatch
						name="Secondary Inverse"
						varName="--pico-secondary-inverse"
					/>
					<ColorSwatch
						name="Secondary Background"
						varName="--pico-secondary-background"
					/>
					<ColorSwatch
						name="Form Element Background"
						varName="--pico-form-element-background-color"
					/>
					<ColorSwatch
						name="Code Background"
						varName="--pico-code-background-color"
					/>
					<ColorSwatch
						name="Muted Border"
						varName="--pico-muted-border-color"
					/>
					<ColorSwatch name="Color (text)" varName="--pico-color" />
					<ColorSwatch
						name="Background Color"
						varName="--pico-background-color"
					/>
					<ColorSwatch name="Del Color (error)" varName="--pico-del-color" />
					<ColorSwatch name="Contrast" varName="--pico-contrast" />
					<ColorSwatch
						name="Contrast Inverse"
						varName="--pico-contrast-inverse"
					/>
					<ColorSwatch name="Accent (custom)" varName="--castro-accent" />
				</div>
			</section>

			<section class="pico-section">
				<h2>Typography</h2>
				<div class="pico-typography-intro">
					<p class="pico-typography-intro-note">
						(CSS var: --pico-font-family)
					</p>
					<h1>Heading 1</h1>
					<h2>Heading 2</h2>
					<h3>Heading 3</h3>
					<h4>Heading 4 (secondary color)</h4>
					<h5>Heading 5 (secondary color)</h5>
					<h6>Heading 6 (muted color)</h6>
				</div>
				<div>
					<p>
						Body text (font-weight: 500). The quick brown fox jumps over the
						lazy dog. <code>inline code</code> example.
					</p>
					<code class="pico-code-block">
						{`// Code block example
const message = "hello world";
console.log(message);`}
					</code>
				</div>
			</section>

			<section class="pico-section">
				<h2>Buttons</h2>
				<div class="pico-button-group">
					<div class="pico-button-item">
						<p class="pico-button-label">c-btn c-btn-primary</p>
						<button class="c-btn c-btn-primary">Primary</button>
					</div>
					<div class="pico-button-item">
						<p class="pico-button-label">c-btn c-btn-neutral</p>
						<button class="c-btn c-btn-neutral">Neutral</button>
					</div>
					<div class="pico-button-item">
						<p class="pico-button-label">c-btn c-btn-base</p>
						<button class="c-btn c-btn-base">Base</button>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Square Buttons</h2>
				<div class="pico-square-buttons">
					<div class="pico-button-item">
						<p class="pico-button-label">c-btn-square c-btn-square-primary</p>
						<button
							class="c-btn-square c-btn-square-primary"
							aria-label="Action"
						>
							★
						</button>
					</div>
					<div class="pico-button-item">
						<p class="pico-button-label">c-btn-square c-btn-square-base</p>
						<button class="c-btn-square c-btn-square-base" aria-label="Action">
							⋯
						</button>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Badges</h2>
				<div class="pico-badges">
					<div class="pico-badge-item">
						<p class="pico-button-label">badge badge-primary</p>
						<span class="badge badge-primary">primary</span>
					</div>
					<div class="pico-badge-item">
						<p class="pico-button-label">badge badge-neutral</p>
						<span class="badge badge-neutral">neutral</span>
					</div>
					<div class="pico-badge-item">
						<p class="pico-button-label">badge badge-error</p>
						<span class="badge badge-error">error</span>
					</div>
					<div class="pico-badge-item">
						<p class="pico-button-label">badge badge-success</p>
						<span class="badge badge-success">success</span>
					</div>
					<div class="pico-badge-item">
						<p class="pico-button-label">badge badge-info</p>
						<span class="badge badge-info">info</span>
					</div>
					<div class="pico-badge-item">
						<p class="pico-button-label">c-badge-dotted</p>
						<span class="c-badge-dotted">dotted</span>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Dividers & Sections</h2>
				<div class="c-divider-section">SECTION DIVIDER</div>
			</section>

			<section class="pico-section">
				<h2>Step Blocks</h2>
				<div class="pico-steps">
					<div class="c-step">
						<div class="c-step-number">1</div>
						<div class="c-step-content">
							<h3 class="c-step-title">First Step</h3>
							<p>This is the first step in a process.</p>
						</div>
					</div>
					<div class="c-step">
						<div class="c-step-number">2</div>
						<div class="c-step-content">
							<h3 class="c-step-title">Second Step</h3>
							<p>This is the second step in a process.</p>
						</div>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Text & Contrast</h2>
				<div class="pico-contrast-grid">
					<div class="pico-contrast-box pico-contrast-box-bg">
						<p class="pico-contrast-text">
							Body text on background (--pico-color)
						</p>
					</div>
					<div class="pico-contrast-box pico-contrast-box-code">
						<p class="pico-contrast-text">Text on code background</p>
					</div>
					<div class="pico-contrast-box pico-contrast-box-primary">
						<p class="pico-contrast-text">Primary inverse text on primary bg</p>
						<h3 class="pico-contrast-heading c-step-title">
							Heading on primary
						</h3>
					</div>
					<div class="pico-contrast-box pico-contrast-box-secondary">
						<p class="pico-contrast-text">
							Secondary inverse text on secondary bg
						</p>
					</div>
					<div class="pico-contrast-box pico-contrast-box-secondary-bg">
						<p class="pico-contrast-text">
							Secondary inverse on secondary background
						</p>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Diagram Components</h2>
				<div class="pico-diagram-grid">
					<div class="c-diagram-box">
						<div class="c-diagram-box-header">
							<span class="badge badge-primary">label</span>
						</div>
						<p>Diagram box content</p>
					</div>
					<div class="pico-diagram-arrow">→</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>Alerts</h2>
				<aside class="alert">
					<p>Default alert (no variant class)</p>
				</aside>
			</section>

			<section class="pico-section">
				<h2>Form Elements</h2>
				<div class="pico-form-grid">
					<div>
						<label htmlFor="form-text">Text Input</label>
						<input id="form-text" type="text" placeholder="Type something..." />
					</div>
					<div>
						<label htmlFor="form-textarea">Textarea</label>
						<textarea id="form-textarea" placeholder="Multiple lines..." />
					</div>
					<div>
						<label htmlFor="form-select">Select</label>
						<select id="form-select">
							<option>Option 1</option>
							<option>Option 2</option>
							<option>Option 3</option>
						</select>
					</div>
				</div>
			</section>

			<section class="pico-section">
				<h2>CSS Variables Reference</h2>
				<div class="pico-variables-ref">
					<code class="pico-variables-code">
						{`/* Colors */
--pico-primary
--pico-primary-inverse
--pico-secondary
--pico-secondary-inverse
--pico-secondary-background
--pico-form-element-background-color
--pico-code-background-color
--pico-muted-border-color
--pico-del-color

/* Text & Background */
--pico-color                   (text color)
--pico-background-color

/* Typography */
--pico-font-family
--pico-line-height
--pico-text-decoration
--pico-transition`}
					</code>
				</div>
			</section>
		</div>
	);
}

function ColorSwatch({ name, varName }: { name: string; varName: string }) {
	return (
		<div class="pico-swatch">
			<div class="pico-swatch-box" style={`background: var(${varName})`} />
			<p class="pico-swatch-name">{name}</p>
			<code class="pico-swatch-var">{varName}</code>
		</div>
	);
}
