import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Route,
  Brain,
  BarChart3,
  Link2,
  Heart,
  Target,
  Zap,
  Shield,
  ChevronDown,
} from "lucide-react";

const features = [
  { icon: Route, title: "Adaptive Training", desc: "Workouts that adjust to your real-time recovery and training load." },
  { icon: Brain, title: "AI Running Coach", desc: "Personalized coaching built from your actual performance data." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Track pace, VO\u2082 Max, fatigue, recovery, and long-term progress." },
  { icon: Link2, title: "Strava Integration", desc: "Import your runs. Get performance intelligence back." },
  { icon: Heart, title: "Recovery Tracking", desc: "Know when to push harder and when to rest." },
  { icon: Target, title: "Personal Goals", desc: "Train for your first 5K, marathon, or consistent running." },
  { icon: Zap, title: "Real-Time Insights", desc: "Performance feedback after every workout." },
  { icon: Shield, title: "Your Data, Your Privacy", desc: "Your running data stays private. You control what gets connected." },
];

const AccordionCard = ({ feature: f }) => {
  const [open, setOpen] = useState(false);
  const panelId = `feature-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="border-b border-white/[0.07] last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-0 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CCFF00]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <f.icon className="h-4 w-4 shrink-0 text-white/35" />
          <h3 className="text-sm font-semibold text-white">{f.title}</h3>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/35 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pb-4 text-sm leading-relaxed text-white/45"
          >
            {f.desc}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={sectionRef}
      aria-labelledby="features-title"
      className="border-t border-[#181818] bg-[#0B0B0B] py-28"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          className="mb-10 grid grid-cols-1 gap-6 lg:mb-16 lg:grid-cols-2 lg:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[#CCFF00]">Features</p>
            <h2 id="features-title" className="text-3xl font-medium leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl">
              Performance intelligence
              <br />in every workout.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45 lg:mt-4 lg:text-base">
              AI-powered coaching that studies your training load, recovery, and pace to build a plan that adapts as you improve.
            </p>
          </div>
          <div className="flex items-end justify-end">
            <p className="text-sm leading-relaxed text-white/30" style={{ maxWidth: 420 }}>
              Track pace, VO₂ Max, fatigue, recovery, and long-term trends.
            </p>
          </div>
        </motion.div>

        {/* Mobile accordion */}
        <div className="border-t border-white/[0.07] sm:hidden">
          {features.map((f) => (
            <AccordionCard key={f.title} feature={f} />
          ))}
        </div>

        {/* Desktop grid */}
        <div
          className="relative hidden border border-white/[0.07] bg-[#0B0B0B] sm:block"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.06 * i }}
                className="group flex items-start gap-5 p-7 lg:p-8 transition-colors duration-300 hover:bg-[#111] border-white/[0.07] border-b last:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-[#0C0C0C] transition-all duration-300 group-hover:border-[#CCFF00]/20 group-hover:bg-[#CCFF00]/5">
                  <f.icon className="h-5 w-5 text-[#CCFF00] transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-snug text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/45">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
