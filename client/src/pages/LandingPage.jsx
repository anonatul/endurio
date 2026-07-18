import Navbar from "../components/Navbar";
import Hero from "../components/Hero.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Features from "../components/Features.jsx";
import FAQ from "../components/FAQ.jsx";
import Footer from "../components/Footer.jsx";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
