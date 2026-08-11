import { Hero } from "./_components/index/Hero";
import { HowItWorks } from "./_components/index/HowItWorks";
import { IslandShowcase } from "./_components/index/IslandShowcase";

export const meta = {
  title: "Castro - The People's Framework",
  description:
    "A static site generator built to be read. Preact islands, JSX, and Bun — small enough to hold in your head.",
};

export default function Home() {
  return (
    <>
      <Hero />

      <HowItWorks />

      <IslandShowcase />
    </>
  );
}
