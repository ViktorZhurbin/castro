export const meta = {
	title: "Theme Playground",
	layout: "default",
	path: "/theme",
};

export default function ThemePlayground() {
	return (
		<div class="p-8 space-y-12 bg-base-100 prose prose-castro">
			<h1>Theme Playground</h1>

			{/* ─── COLOR SWATCHES ─── */}
			<section class="space-y-3">
				<h2>Color Palette</h2>
				<div class="flex flex-wrap gap-2">
					<div class="bg-base-100 text-base-content w-28 h-16 flex items-end p-2 text-xs font-mono border border-base-300">
						base-100
					</div>
					<div class="bg-base-200 text-base-content w-28 h-16 flex items-end p-2 text-xs font-mono border border-base-300">
						base-200
					</div>
					<div class="bg-base-300 text-base-content w-28 h-16 flex items-end p-2 text-xs font-mono border border-base-300">
						base-300
					</div>
				</div>
				<div class="flex flex-wrap gap-2">
					<div class="bg-primary text-primary-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						primary
					</div>
					<div class="bg-secondary text-secondary-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						secondary
					</div>
					<div class="bg-accent text-accent-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						accent
					</div>
					<div class="bg-neutral text-neutral-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						neutral
					</div>
					<div class="bg-info text-info-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						info
					</div>
					<div class="bg-success text-success-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						success
					</div>
					<div class="bg-warning text-warning-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						warning
					</div>
					<div class="bg-error text-error-content w-28 h-16 flex items-end p-2 text-xs font-mono">
						error
					</div>
				</div>
			</section>

			{/* ─── BUTTONS ─── */}
			<section class="space-y-3">
				<h2>Buttons</h2>
				<div class="flex flex-wrap gap-2">
					<button class="btn">default</button>
					<button class="btn btn-primary">primary</button>
					<button class="btn btn-secondary">secondary</button>
					<button class="btn btn-accent">accent</button>
					<button class="btn btn-neutral">neutral</button>
					<button class="btn btn-info">info</button>
					<button class="btn btn-success">success</button>
					<button class="btn btn-warning">warning</button>
					<button class="btn btn-error">error</button>
				</div>
				<div class="flex flex-wrap gap-2">
					<button class="btn btn-outline">default</button>
					<button class="btn btn-outline btn-primary">primary</button>
					<button class="btn btn-outline btn-secondary">secondary</button>
					<button class="btn btn-outline btn-accent">accent</button>
					<button class="btn btn-outline btn-neutral">neutral</button>
					<button class="btn btn-outline btn-info">info</button>
					<button class="btn btn-outline btn-success">success</button>
					<button class="btn btn-outline btn-warning">warning</button>
					<button class="btn btn-outline btn-error">error</button>
				</div>
				<div class="flex flex-wrap gap-2">
					<button class="btn btn-soft">default</button>
					<button class="btn btn-soft btn-primary">primary</button>
					<button class="btn btn-soft btn-secondary">secondary</button>
					<button class="btn btn-soft btn-accent">accent</button>
					<button class="btn btn-soft btn-neutral">neutral</button>
					<button class="btn btn-soft btn-info">info</button>
					<button class="btn btn-soft btn-success">success</button>
					<button class="btn btn-soft btn-warning">warning</button>
					<button class="btn btn-soft btn-error">error</button>
				</div>
				<div class="flex flex-wrap gap-2">
					<button class="btn btn-ghost">ghost</button>
					<button class="btn btn-link">link</button>
					<button class="btn btn-xs">xs</button>
					<button class="btn btn-sm">sm</button>
					<button class="btn btn-md">md</button>
					<button class="btn btn-lg">lg</button>
					<button class="btn btn-xl">xl</button>
				</div>
			</section>

			{/* ─── BADGES ─── */}
			<section class="space-y-3">
				<h2>Badges</h2>
				<div class="flex flex-wrap gap-2 items-center">
					<span class="badge">default</span>
					<span class="badge badge-primary">primary</span>
					<span class="badge badge-secondary">secondary</span>
					<span class="badge badge-accent">accent</span>
					<span class="badge badge-neutral">neutral</span>
					<span class="badge badge-info">info</span>
					<span class="badge badge-success">success</span>
					<span class="badge badge-warning">warning</span>
					<span class="badge badge-error">error</span>
				</div>
				<div class="flex flex-wrap gap-2 items-center">
					<span class="badge badge-outline">default</span>
					<span class="badge badge-outline badge-primary">primary</span>
					<span class="badge badge-outline badge-secondary">secondary</span>
					<span class="badge badge-outline badge-accent">accent</span>
					<span class="badge badge-outline badge-neutral">neutral</span>
					<span class="badge badge-outline badge-info">info</span>
					<span class="badge badge-outline badge-success">success</span>
					<span class="badge badge-outline badge-warning">warning</span>
					<span class="badge badge-outline badge-error">error</span>
				</div>
				<div class="flex flex-wrap gap-2 items-center">
					<span class="badge badge-soft">default</span>
					<span class="badge badge-soft badge-primary">primary</span>
					<span class="badge badge-soft badge-secondary">secondary</span>
					<span class="badge badge-soft badge-accent">accent</span>
					<span class="badge badge-soft badge-neutral">neutral</span>
					<span class="badge badge-soft badge-info">info</span>
					<span class="badge badge-soft badge-success">success</span>
					<span class="badge badge-soft badge-warning">warning</span>
					<span class="badge badge-soft badge-error">error</span>
				</div>
			</section>

			{/* ─── ALERTS ─── */}
			<section class="space-y-3">
				<h2>Alerts</h2>
				<div class="space-y-2 max-w-xl">
					<div class="alert">
						<span>This is a default alert.</span>
					</div>
					<div class="alert alert-info">
						<span>
							This is an <strong>info</strong> alert.
						</span>
					</div>
					<div class="alert alert-success">
						<span>
							This is a <strong>success</strong> alert.
						</span>
					</div>
					<div class="alert alert-warning">
						<span>
							This is a <strong>warning</strong> alert.
						</span>
					</div>
					<div class="alert alert-error">
						<span>
							This is an <strong>error</strong> alert.
						</span>
					</div>
				</div>
			</section>

			{/* ─── INPUTS ─── */}
			{/* <section class="space-y-3">
				<h2>Inputs</h2>
				<div class="flex flex-wrap gap-2">
					<input class="input w-36" type="text" placeholder="default" />
					<input class="input input-primary w-36" type="text" placeholder="primary" />
					<input class="input input-secondary w-36" type="text" placeholder="secondary" />
					<input class="input input-accent w-36" type="text" placeholder="accent" />
					<input class="input input-neutral w-36" type="text" placeholder="neutral" />
					<input class="input input-info w-36" type="text" placeholder="info" />
					<input class="input input-success w-36" type="text" placeholder="success" />
					<input class="input input-warning w-36" type="text" placeholder="warning" />
					<input class="input input-error w-36" type="text" placeholder="error" />
				</div>
			</section> */}

			{/* ─── MOCKUP CODE ─── */}
			<div class="mockup-code w-full">
				<pre data-prefix="1">
					<code>npm i daisyui</code>
				</pre>
				<pre data-prefix="2">
					<code>installing...</code>
				</pre>
				<pre data-prefix="3" class="bg-warning text-warning-content">
					<code>Error!</code>
				</pre>
			</div>

			{/* ─── CHECKBOXES / TOGGLES ─── */}
			<section class="space-y-3">
				<h2>Checkboxes & Toggles</h2>
				<div class="flex flex-wrap gap-4 items-center">
					<input type="checkbox" class="checkbox" checked />
					<input type="checkbox" class="checkbox checkbox-primary" checked />
					<input type="checkbox" class="checkbox checkbox-secondary" checked />
					<input type="checkbox" class="checkbox checkbox-accent" checked />
					<input type="checkbox" class="checkbox checkbox-neutral" checked />
					<input type="checkbox" class="checkbox checkbox-info" checked />
					<input type="checkbox" class="checkbox checkbox-success" checked />
					<input type="checkbox" class="checkbox checkbox-warning" checked />
					<input type="checkbox" class="checkbox checkbox-error" checked />
				</div>
				<div class="flex flex-wrap gap-4 items-center">
					<input type="checkbox" class="toggle" checked />
					<input type="checkbox" class="toggle toggle-primary" checked />
					<input type="checkbox" class="toggle toggle-secondary" checked />
					<input type="checkbox" class="toggle toggle-accent" checked />
					<input type="checkbox" class="toggle toggle-neutral" checked />
					<input type="checkbox" class="toggle toggle-info" checked />
					<input type="checkbox" class="toggle toggle-success" checked />
					<input type="checkbox" class="toggle toggle-warning" checked />
					<input type="checkbox" class="toggle toggle-error" checked />
				</div>
			</section>

			{/* ─── TYPOGRAPHY ─── */}
			<section class="space-y-3">
				<h2>Typography</h2>
				<div class="space-y-1">
					<p class="text-xs">
						text-xs — The workers seize the means of production.
					</p>
					<p class="text-sm">
						text-sm — The workers seize the means of production.
					</p>
					<p class="text-base">
						text-base — The workers seize the means of production.
					</p>
					<p class="text-lg">
						text-lg — The workers seize the means of production.
					</p>
					<p class="text-xl font-semibold">
						text-xl — The workers seize the means of production.
					</p>
					<p class="text-2xl font-bold">
						text-2xl — The workers seize the means of production.
					</p>
					<p class="text-3xl font-black">
						text-3xl — The workers seize the means of production.
					</p>
				</div>
				<div class="flex flex-wrap gap-4 mt-2">
					<span class="text-primary font-semibold">primary</span>
					<span class="text-secondary font-semibold">secondary</span>
					<span class="text-accent font-semibold">accent</span>
					<span class="text-neutral font-semibold">neutral</span>
					<span class="text-info font-semibold">info</span>
					<span class="text-success font-semibold">success</span>
					<span class="text-warning font-semibold">warning</span>
					<span class="text-error font-semibold">error</span>
				</div>
			</section>

			{/* ─── LINKS ─── */}
			<section class="space-y-3">
				<h2>Links</h2>
				<div class="flex flex-wrap gap-4">
					<a class="link">default</a>
					<a class="link link-primary">primary</a>
					<a class="link link-secondary">secondary</a>
					<a class="link link-accent">accent</a>
					<a class="link link-neutral">neutral</a>
					<a class="link link-info">info</a>
					<a class="link link-success">success</a>
					<a class="link link-warning">warning</a>
					<a class="link link-error">error</a>
				</div>
				<div class="flex flex-wrap gap-4">
					<a class="link link-hover">hover-only underline</a>
					<a class="link link-primary link-hover">primary hover</a>
				</div>
			</section>

			{/* ─── CARDS ─── */}
			<section class="space-y-3">
				<h2>Cards</h2>
				<div class="flex flex-wrap gap-4">
					<div class="card bg-base-100 card-border border-base-300 w-64">
						<div class="card-body">
							<span class="card-title">Base 100</span>
							<p class="text-sm">Standard card on base background.</p>
							<div class="card-actions">
								<button class="btn btn-primary btn-sm">Action</button>
							</div>
						</div>
					</div>
					<div class="card bg-base-200 card-border border-base-300 w-64">
						<div class="card-body">
							<span class="card-title">Base 200</span>
							<p class="text-sm">Card on secondary background.</p>
							<div class="card-actions">
								<button class="btn btn-secondary btn-sm">Action</button>
							</div>
						</div>
					</div>
					<div class="card bg-primary text-primary-content w-64">
						<div class="card-body">
							<span class="card-title">Primary</span>
							<p class="text-sm">Card with primary background.</p>
							<div class="card-actions">
								<button class="btn btn-sm">Action</button>
							</div>
						</div>
					</div>
					<div class="card bg-neutral text-neutral-content w-64">
						<div class="card-body">
							<span class="card-title">Neutral</span>
							<p class="text-sm">Card with neutral background.</p>
							<div class="card-actions">
								<button class="btn btn-sm">Action</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── STEPS ─── */}
			<section class="space-y-3">
				<h2>Steps</h2>
				<ul class="steps w-full">
					<li class="step step-primary">Primary</li>
					<li class="step step-primary">Primary</li>
					<li class="step">Default</li>
					<li class="step">Default</li>
				</ul>
				<ul class="steps w-full">
					<li class="step step-secondary">Secondary</li>
					<li class="step step-secondary">Secondary</li>
					<li class="step step-secondary">Secondary</li>
					<li class="step">Default</li>
				</ul>
				<ul class="steps w-full">
					<li class="step step-accent">Accent</li>
					<li class="step">Default</li>
					<li class="step step-accent">Accent</li>
					<li class="step step-accent">Accent</li>
				</ul>
				<ul class="steps w-full">
					<li class="step step-success">Success</li>
					<li class="step step-success">Success</li>
					<li class="step step-warning">Warning</li>
					<li class="step step-error">Error</li>
				</ul>
			</section>

			{/* ─── TABLES ─── */}
			<section class="space-y-3">
				<h2>Tables</h2>
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th></th>
								<th>Name</th>
								<th>Job</th>
								<th>Favorite Color</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th>1</th>
								<td>Cy Ganderton</td>
								<td>Quality Control Specialist</td>
								<td>Blue</td>
							</tr>
							<tr>
								<th>2</th>
								<td>Hart Hagerty</td>
								<td>Desktop Support Technician</td>
								<td>Purple</td>
							</tr>
							<tr>
								<th>3</th>
								<td>Brice Swyre</td>
								<td>Tax Accountant</td>
								<td>Red</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th></th>
								<th>Name</th>
								<th>Job</th>
								<th>Favorite Color</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th>1</th>
								<td>Cy Ganderton</td>
								<td>Quality Control Specialist</td>
								<td>Blue</td>
							</tr>
							<tr class="hover:bg-base-300">
								<th>2</th>
								<td>Hart Hagerty</td>
								<td>Desktop Support Technician</td>
								<td>Purple</td>
							</tr>
							<tr>
								<th>3</th>
								<td>Brice Swyre</td>
								<td>Tax Accountant</td>
								<td>Red</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			{/* ─── DIVIDERS ─── */}
			<section class="space-y-3">
				<h2>Dividers</h2>
				<div class="max-w-xl">
					<div class="divider">default</div>
					<div class="divider divider-primary">primary</div>
					<div class="divider divider-secondary">secondary</div>
				</div>
			</section>
		</div>
	);
}
