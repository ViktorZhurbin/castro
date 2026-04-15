interface GreetingProps {
	name?: string;
}

export default function Greeting({ name = "Developer" }: GreetingProps) {
	return (
		<section>
			<h2>Welcome, {name}!</h2>
			<p>This is a simple component example. Edit this file to customize your greeting.</p>
		</section>
	);
}
