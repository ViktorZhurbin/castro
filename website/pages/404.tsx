import { StarIcon } from "@components/icons/StarIcon.tsx";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<div class="flex-1 flex items-center justify-center bg-base-200 py-24 px-6">
			<div class="max-w-lg text-center">
				<div class="w-32 h-32 mx-auto mb-10 text-primary">
					<StarIcon />
				</div>
				<h1 class="text-9xl">404</h1>
				<div class="border-t-4 border-primary max-w-xs mx-auto my-6" />
				<h2 class="mb-8">PAGE NOT FOUND</h2>
				<p class="text-lg font-bold mb-10">
					This page has been redacted by the Ministry of Truth.
					<br />
					It never existed.
				</p>
				<a href="/" class="c-btn c-btn-primary">
					RETURN TO THE COLLECTIVE
				</a>
			</div>
		</div>
	);
}
