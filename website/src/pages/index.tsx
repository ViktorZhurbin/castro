import { Demonstration } from "./_components/index/Demonstration";
import { Hero } from "./_components/index/Hero";
import { MeansOfProduction } from "./_components/index/MeansOfProduction";
import { SmallEnoughToRead } from "./_components/index/SmallEnoughToRead";
import { StandingDirectives } from "./_components/index/StandingDirectives";
import { Why } from "./_components/index/Why";

export const meta = {
  title: "Castro - The People's Framework",
  description:
    "A static site generator built on Bun and Preact. JSX and Markdown go in, static HTML comes out. Interactive islands where you need them.",
};

export default function Home() {
  return (
    <>
      <Hero />

      <MeansOfProduction />

      <StandingDirectives />

      <Demonstration />

      <Why />

      <SmallEnoughToRead />
    </>
  );
}
