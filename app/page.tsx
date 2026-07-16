import { LandingNav } from "@/components/layout/landing-nav";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/features/landing/hero-section";
import { StatsSection } from "@/features/landing/stats-section";
import { ModulesSection } from "@/features/landing/modules-section";
import { TechSection } from "@/features/landing/tech-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <ModulesSection />
        <TechSection />
      </main>
      <Footer />
    </div>
  );
}
