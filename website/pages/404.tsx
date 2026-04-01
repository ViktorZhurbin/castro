import { StarIcon } from "../components/icons/StarIcon.tsx";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<div className="hero flex-1 bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-lg">
					<div className="w-32 h-32 mx-auto mb-10 text-primary">
						<StarIcon />
					</div>
					<h1 className="font-display text-9xl text-primary">404</h1>
					<div className="divider divider-primary max-w-xs mx-auto" />
					<h2 className="font-display text-4xl mb-8 text-secondary">
						PAGE NOT FOUND
					</h2>
					<p className="text-lg font-bold mb-10">
						This page has been redacted by the Ministry of Truth.
						<br />
						It never existed.
					</p>
					<a href="/" className="btn btn-primary btn-lg font-display text-xl">
						RETURN TO THE COLLECTIVE
					</a>
				</div>
			</div>
		</div>
	);
}
