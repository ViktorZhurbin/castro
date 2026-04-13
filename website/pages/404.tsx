import { StarIcon } from "@components/icons/StarIcon.tsx";
import "./404.css";

export const meta = {
	title: "404 - Page Not Found",
};

export default function NotFound() {
	return (
		<div class="not-found-container">
			<div class="container not-found-content">
				<div class="not-found-icon">
					<StarIcon />
				</div>
				<h1>404</h1>
				<div class="not-found-divider" />
				<h2>PAGE NOT FOUND</h2>
				<p class="not-found-message">
					This page has been redacted by the Ministry of Truth.
					<br />
					It never existed.
				</p>
				<a href="/" class="btn btn-primary">
					RETURN TO THE COLLECTIVE
				</a>
			</div>
		</div>
	);
}
