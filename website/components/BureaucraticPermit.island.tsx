export default function BureaucraticPermit() {
	return (
		<div className="relative overflow-hidden">
			<h4 className="font-display text-lg mb-4">
				FORM 27B/6 — REQUEST FOR CLIENT-SIDE INTERACTIVITY
			</h4>
			<fieldset className="space-y-3">
				<input
					type="text"
					className="input input-bordered w-full"
					placeholder="Reason for JavaScript request"
					disabled
				/>
				<div className="space-y-1 text-sm">
					<label className="flex items-center gap-2">
						<input type="checkbox" className="checkbox checkbox-sm" disabled />
						Component requires user interaction
					</label>
					<label className="flex items-center gap-2">
						<input type="checkbox" className="checkbox checkbox-sm" disabled />
						Static HTML is insufficient
					</label>
					<label className="flex items-center gap-2">
						<input type="checkbox" className="checkbox checkbox-sm" disabled />I
						have read the Party's rendering guidelines
					</label>
				</div>
				<button className="btn btn-primary w-full">SUBMIT REQUEST</button>
			</fieldset>
			<p className="text-error text-sm font-bold mt-3">
				FORM STATUS: PERMANENTLY PENDING
			</p>
			<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] text-6xl font-display text-error/10 pointer-events-none select-none whitespace-nowrap">
				JS DENIED
			</span>
		</div>
	);
}
