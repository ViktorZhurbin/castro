import { StarIcon } from "../components/icons/StarIcon.tsx";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<div className="hero min-h-[calc(100vh-3rem)] bg-neutral text-neutral-content castro-rays">
			<div className="hero-content text-center">
				<div className="max-w-lg">
					<div className="w-24 h-24 mx-auto mb-10 text-neutral-content/20">
						<StarIcon />
					</div>
					<h1 className="font-display text-9xl text-secondary drop-shadow-md">
						404
					</h1>
					<h2 className="font-display text-4xl tracking-wide mt-4 mb-8">
						PAGE NOT FOUND
					</h2>
					<p className="text-lg font-bold mb-10 text-neutral-content">
						This page has been redacted by the Ministry of Truth.
						<br />
						It never existed.
					</p>
					<a
						href="/"
						className="btn btn-primary btn-lg font-display text-xl tracking-wider"
					>
						RETURN TO THE COLLECTIVE
					</a>
				</div>
			</div>
		</div>
	);
}
