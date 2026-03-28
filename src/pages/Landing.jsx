import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import HowItWorks from "../components/landing/HowItWorks";
import UseCases from "../components/landing/UseCases";
import PricingSection from "../components/landing/PricingSection";
import Footer from "../components/landing/Footer";

const HERO_IMAGE = "/__generating__/img_6bfc035b42ef.png";
const FEATURES_IMAGE = "/__generating__/img_1318b67e5c64.png";

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