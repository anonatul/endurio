import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import StravaLogo from "./ui/strava-logo";

function useAnimated(target, inView, opts = {}) {
  const { duration = 1800, format = (v) => v } = opts;
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    let start;
    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      setVal(format(t * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, format]);
  return val;
}

const PulseDot = () => (
  <span className="relative flex h-2 w-2">
    <motion.span
      className="absolute inline-flex h-full w-full rounded-full bg-[#CCFF00]"
      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#CCFF00]" />
  </span>
);

const Step1Visual = ({ inView }) => {
  const items = [
    { label: "Strava", accent: true },
    { label: "Runs" },
    { label: "Heart Rate" },
    { label: "Cadence" },
    { label: "Elevation" },
  ];

  return (
    <div className="flex h-full flex-col border border-white/[0.07] p-5" style={{ background: "#0C0C0C" }}>
      <div className="mb-4 flex items-center gap-2.5">
        <PulseDot />
        <span className="text-sm font-medium text-white">Connected</span>
        <span className="ml-auto text-[11px] text-white/35">Last Sync 2 min ago</span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#333]" />
            <span className={item.accent ? "text-[#fc5200]" : "text-white/45"}>
              {item.label}
            </span>
            {item.label === "Strava" && (
              <StravaLogo className="ml-auto h-3 w-auto opacity-40" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const MiniChart = ({ inView, values, color = "#fff" }) => {
  const max = Math.max(...values);
  const h = 36;
  const w = 100;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`);
  const d = "M" + pts.join(" L");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ delay: 0.7, duration: 1.6, ease: "easeInOut" }}
      />
    </svg>
  );
};

const MetricBox = ({ label, children }) => (
  <div className="border border-white/[0.07] px-4 py-3" style={{ background: "#0C0C0C" }}>
    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/35">{label}</span>
    {children}
  </div>
);

const Step2Visual = ({ inView }) => {
  const vo2 = useAnimated(54, inView, { format: Math.floor });
  const dist = useAnimated(48, inView, { format: Math.floor });
  const fatigue = useAnimated(43, inView, { format: Math.floor });
  const load = useAnimated(76, inView, { format: Math.floor });
  const recoveryW = useAnimated(82, inView, { duration: 1400 });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricBox label="VO\u2082 Max">
          <motion.p
            className="mt-1 text-lg font-bold tabular-nums text-white"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            {vo2}
          </motion.p>
        </MetricBox>
        <MetricBox label="Weekly Distance">
          <motion.p
            className="mt-1 text-lg font-bold tabular-nums text-white"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            {dist} km
          </motion.p>
        </MetricBox>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricBox label="Recovery">
          <div className="mt-2">
            <motion.span
              className="text-sm font-bold tabular-nums text-[#CCFF00]"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
            >
              {Math.round(recoveryW)}%
            </motion.span>
            <div className="mt-1.5 h-1.5 rounded-full bg-[#1a1a1a]">
              <motion.div
                className="h-full rounded-full bg-[#CCFF00]"
                initial={{ width: 0 }}
                animate={inView ? { width: `${(recoveryW / 100) * 100}%` } : {}}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </MetricBox>
        <MetricBox label="Fatigue">
          <motion.p
            className="mt-1 text-lg font-bold tabular-nums text-white/45"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            {fatigue}%
          </motion.p>
        </MetricBox>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricBox label="Training Load">
          <motion.p
            className="mt-1 text-lg font-bold tabular-nums text-white"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            {load}
          </motion.p>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#1a1a1a]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#666" }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(load / 100) * 100}%` } : {}}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </MetricBox>
        <MetricBox label="Pace Trend">
          <div className="mt-1">
            <MiniChart inView={inView} values={[32, 28, 30, 26, 24, 22]} color="#CCFF00" />
          </div>
        </MetricBox>
      </div>
    </div>
  );
};

const WorkoutLine = ({ label, value, delay }) => (
  <motion.div
    className="flex items-center justify-between py-1.5"
    initial={{ opacity: 0 }}
    animate={delay !== undefined ? { opacity: 1 } : {}}
    transition={{ delay, duration: 0.3 }}
  >
    <span className="text-sm text-white/35">{label}</span>
    <span className="text-sm font-medium text-white/45">{value}</span>
  </motion.div>
);

const Step3Visual = ({ inView }) => {
  const recoveryW = useAnimated(82, inView, { duration: 1400 });

  return (
    <div className="flex h-full flex-col border border-white/[0.07] p-5" style={{ background: "#0C0C0C" }}>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Tomorrow</span>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#CCFF00]/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] font-semibold text-[#CCFF00]">Ready</span>
        </motion.div>
      </div>

      <motion.h3
        className="text-2xl font-bold text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Tempo Run
      </motion.h3>

      <div className="mt-4 divide-y divide-white/[0.07] border-t border-b border-white/[0.07]">
        <WorkoutLine label="Warm Up" value="2 km" delay={inView ? 0.35 : undefined} />
        <WorkoutLine label="Main Set" value="5 \u00d7 800m" delay={inView ? 0.45 : undefined} />
        <WorkoutLine label="Cool Down" value="2 km" delay={inView ? 0.55 : undefined} />
        <WorkoutLine label="Expected Time" value="58 min" delay={inView ? 0.65 : undefined} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/35">Recovery</span>
          <span className="text-sm font-bold tabular-nums text-[#CCFF00]">{Math.round(recoveryW)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-[#1a1a1a]">
          <motion.div
            className="h-full rounded-full bg-[#CCFF00]"
            initial={{ width: 0 }}
            animate={inView ? { width: `${(recoveryW / 100) * 100}%` } : {}}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>

      <motion.button
        className="mt-5 flex w-full items-center justify-center gap-2 border border-white/[0.07] py-3 text-sm font-medium transition-all hover:border-white/20 hover:text-white text-white/45"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        <Play className="h-3.5 w-3.5" />
        Start Workout
      </motion.button>
    </div>
  );
};

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const steps = [
    {
      num: "01",
      title: "Connect your data",
      desc: "Import your Strava history. Your performance profile builds automatically.",
      visual: Step1Visual,
    },
    {
      num: "02",
      title: "AI understands your fitness",
      desc: "The engine analyzes your pace, recovery, consistency, and load to map your real performance.",
      visual: Step2Visual,
    },
    {
      num: "03",
      title: "Receive intelligent training",
      desc: "Adaptive workouts that evolve as your fitness improves.",
      visual: Step3Visual,
    },
  ];

  return (
    <section id="coach" ref={sectionRef} aria-labelledby="coach-title" className="relative border-t border-[#181818] bg-[#0B0B0B] py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[#CCFF00]">
              How it Works
            </p>
            <h2 id="coach-title" className="text-5xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl text-white">
              How it works.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/45">
              Your running data becomes performance intelligence in three steps.
            </p>
          </div>
          <div className="flex items-end justify-end">
            <p className="text-sm leading-relaxed text-white/30" style={{ maxWidth: 420 }}>
              Endurio studies your training load, recovery trends, and pace to build a constantly adapting plan.
            </p>
          </div>
        </motion.div>

        <div
          className="relative border border-white/[0.07] bg-[#0B0B0B]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {steps.map((step, i) => {
              const Visual = step.visual;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * i }}
                  className="group flex flex-col gap-5 p-7 lg:p-8 transition-colors duration-300 hover:bg-[#111] border-white/[0.07] border-b last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.07] transition-all duration-300 group-hover:border-[#CCFF00]/20 group-hover:bg-[#CCFF00]/5 bg-[#0C0C0C]">
                    <span className="text-sm font-bold text-[#CCFF00]">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/45">{step.desc}</p>
                  </div>
                  <div className="flex-1">
                    <Visual inView={isInView && i <= 2} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
