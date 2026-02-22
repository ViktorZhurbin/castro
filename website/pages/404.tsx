import { StarIcon } from "../components/icons/StarIcon.tsx";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<div className="hero min-h-screen bg-neutral text-neutral-content">
			<div className="hero-content text-center">
				<div className="max-w-lg">
					<div className="w-20 h-20 mx-auto mb-8 opacity-30 text-base-content">
						<StarIcon />
					</div>
					<h1 className="text-8xl font-bold text-error mb-2">404</h1>
					<h2 className="text-3xl font-bold uppercase mb-6">Page Not Found</h2>
					<p className="text-lg font-bold mb-2">
						This page has been redacted by the Ministry of Truth.
						<br />
						It never existed.
					</p>
					<a href="/" className="btn btn-primary btn-lg uppercase">
						Return to the Collective
					</a>
				</div>
			</div>
		</div>
	);
}
