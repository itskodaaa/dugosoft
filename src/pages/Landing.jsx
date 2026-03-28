import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import HowItWorks from "../components/landing/HowItWorks";
import UseCases from "../components/landing/UseCases";
import PricingSection from "../components/landing/PricingSection";
import Footer from "../components/landing/Footer";

const HERO_IMAGE = "https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/9bc0b0e7c_generated_11ff43b7.png";
const FEATURES_IMAGE = "https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/9441e4f0f_generated_a5609f95.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <HeroSection heroImage={HERO_IMAGE} />
        <div id="features">
          <FeaturesGrid featuresImage={FEATURES_IMAGE} />
        </div>
        <HowItWorks />
        <UseCases />
        <div id="pricing">
          <PricingSection />
        </div>
        <Footer />
      </div>
    </div>
  );
}