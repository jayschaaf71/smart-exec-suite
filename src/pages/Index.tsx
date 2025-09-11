import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { AcademySection } from "@/components/sections/AcademySection";
import { AboutSection } from "@/components/sections/AboutSection";
import { FooterSection } from "@/components/sections/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AcademySection />
        <AboutSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
