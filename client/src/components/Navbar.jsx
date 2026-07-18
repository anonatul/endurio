import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${ scrolled ? "border-b border-white/[0.04] bg-[#0B0B0B]/70 backdrop-blur-xl" : "bg-transparent" }`} >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
          Endurio
        </span>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm text-white/45 md:flex">
          <a href="#features" className="transition hover:text-white focus-ring">Features</a>
          <a href="#coach" className="transition hover:text-white focus-ring">Coach</a>
          <a href="#faq" className="transition hover:text-white focus-ring">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-white/45 transition hover:text-white focus-ring">
            Log in
          </a>
          <a
            href="/start"
            className="group flex items-center gap-1.5 rounded-full border border-white/[0.12] px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black focus-ring"
          >
            Start
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
