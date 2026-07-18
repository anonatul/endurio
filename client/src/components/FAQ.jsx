import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "How does Endurio connect with Strava?", a: "Link your Strava account in one click. Endurio imports your run history, pace data, heart rate, and elevation to build your fitness profile." },
  { q: "Is Endurio really free?", a: "Yes. This is a hobby project built for runners. No paywalls, no subscriptions — just adaptive AI coaching." },
  { q: "How does the AI personalize my plan?", a: "The coaching engine analyzes your training load, recovery trends, pace consistency, and performance over time to create workouts that match your actual fitness." },
  { q: "What if I miss a workout?", a: "Plans adapt automatically. Skip a run and Endurio adjusts your upcoming sessions so you stay on track without guilt." },
  { q: "Does Endurio work for beginners?", a: "Absolutely. Whether you're training for your first 5K or your tenth marathon, the AI builds a plan around your current fitness level." },
];

const Item = ({ f }) => {
  const [open, setOpen] = useState(false);
  const panelId = `faq-${f.q.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="border-b border-[#181818] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-white/80 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CCFF00] sm:py-6"
      >
        <span className="text-sm font-medium text-white/45 sm:text-base">{f.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/20 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pb-5 text-sm leading-relaxed text-white/30 sm:pb-6"
          >
            {f.a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => (
  <section id="faq" aria-labelledby="faq-title" className="border-t border-[#181818] bg-[#0B0B0B] py-28">
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[#CCFF00]">FAQ</p>
      <h2 id="faq-title" className="text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl">
        Questions?
      </h2>
      <div className="mt-10">
        {faqs.map((f) => (
          <Item key={f.q} f={f} />
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
