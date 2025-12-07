import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Advantages from "@/components/Advantages";
import TechStack from "@/components/TechStack";
import Roadmap from "@/components/Roadmap";
import Team from "@/components/Team";
import GetInvolved from "@/components/GetInvolved";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Advantages />
      <TechStack />
      <Roadmap />
      {/* <Team /> */}
      <GetInvolved />
      <Footer />
    </main>
  );
};

export default Index;
