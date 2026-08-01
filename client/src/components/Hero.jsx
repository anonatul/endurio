import HeroBackground from "./ui/hero-background";
import StravaLogo from "./ui/strava-logo";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Gauge,
  Link2,
  TrendingUp,
} from "lucide-react";

const plan = [
  { day: "Mon", title: "Easy run", detail: "6 km at conversational pace", state: "Done" },
  { day: "Tue", title: "Tempo session", detail: "5 x 800m with jog recovery", state: "Next", active: true },
  { day: "Wed", title: "Recovery", detail: "Rest day and mobility", state: "Light" },
  { day: "Thu", title: "Aerobic build", detail: "8 km steady effort", state: "Planned" },
  { day: "Sat", title: "Long run", detail: "14 km relaxed", state: "Planned" },
];

const metrics = [
  { label: "Recovery", value: "82%", note: "ready", icon: Gauge },
  { label: "Load", value: "76", note: "balanced", icon: CalendarDays },
  { label: "Pace", value: "4:38", note: "tempo", icon: TrendingUp },
];

const ProductPreview = () => (
  <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-1.5 shadow-[0_32px_90px_rgba(0,0,0,0.45)] sm:rounded-[1.75rem] sm:p-2">
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101010] sm:rounded-[1.35rem]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/20 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-white/20 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-white/20 sm:h-2.5 sm:w-2.5" />
        </div>
        <div className="hidden rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/35 sm:block">
          endurio.app/plan
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35 sm:gap-2 sm:text-xs">
          <span className="h-1 w-1.5 rounded-full bg-[#CCFF00] sm:h-1.5" />
          Synced
        </div>
      </div>

      <div className="grid lg:grid-cols-[14rem_1fr_18rem] xl:grid-cols-[15rem_1fr_21rem]">
        <aside className="hidden border-r border-white/[0.07] p-5 lg:block">
          <div className="text-sm font-medium text-white">Endurio</div>
          <nav className="mt-8 space-y-1 text-sm text-white/38">
            <div className="rounded-xl bg-white/[0.05] px-3 py-2 text-white/80">Plan</div>
            <div className="px-3 py-2">Activity</div>
            <div className="px-3 py-2">Progress</div>
            <div className="px-3 py-2">Settings</div>
          </nav>
          <div className="mt-10 rounded-2xl border border-white/[0.07] bg-[#0C0C0C] p-4">
            <div className="flex items-center gap-2 text-xs text-white/35">
              <Link2 className="h-3.5 w-3.5 text-[#fc5200]" />
              Strava connected
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Last activity imported 2 minutes ago.
            </p>
          </div>
        </aside>

        <main className="border-b border-white/[0.07] p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 sm:text-xs">Week 7 of 12</p>
              <h2 className="mt-1.5 text-xl font-medium tracking-[-0.03em] text-white sm:mt-2 sm:text-2xl lg:text-4xl">
                Training plan
              </h2>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/40 sm:mt-2 sm:text-sm">
                Adjusted after your latest run and current recovery trend.
              </p>
            </div>
            <div className="inline-flex items-center rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-2 text-xs text-[#CCFF00] sm:px-4 sm:py-3 sm:text-sm">
              82% ready
            </div>
          </div>

          <div className="mt-5 divide-y divide-white/[0.07] overflow-hidden rounded-xl border border-white/[0.07] bg-[#0C0C0C] sm:mt-7 sm:rounded-2xl">
            {plan.map((item) => (
              <div
                key={item.day}
                className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[3rem_1fr_auto] sm:gap-3 sm:px-4 sm:py-3.5 ${
                  item.active ? "bg-white/[0.04]" : ""
                }`}
              >
                <span className="text-[11px] text-white/35 sm:text-sm">{item.day}</span>
                <div>
                  <p className="text-xs font-medium text-white/85 sm:text-sm">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/35 sm:mt-0.5 sm:text-xs">{item.detail}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] ${
                    item.active
                      ? "border-[#CCFF00]/25 text-[#CCFF00]"
                      : "border-white/[0.08] text-white/35"
                  }`}
                >
                  {item.state}
                </span>
              </div>
            ))}
          </div>
        </main>

        <aside className="p-4 sm:p-5 lg:p-7">
          <div className="rounded-xl border border-white/[0.07] bg-[#0C0C0C] p-4 sm:rounded-2xl sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 sm:text-xs">Next workout</p>
            <h3 className="mt-2 text-xl font-medium tracking-[-0.03em] text-white sm:mt-3 sm:text-2xl">Tempo session</h3>
            <div className="mt-4 space-y-1.5 text-xs text-white/45 sm:mt-5 sm:space-y-2 sm:text-sm">
              <div className="flex justify-between gap-4">
                <span>Warm up</span>
                <span className="text-white/70">2 km</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Main set</span>
                <span className="text-white/70">5 x 800m</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Recovery</span>
                <span className="text-white/70">90 sec jog</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Cool down</span>
                <span className="text-white/70">2 km</span>
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2 lg:grid-cols-1">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-xl border border-white/[0.07] bg-[#0C0C0C] p-3 sm:rounded-2xl sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-white/35 sm:text-xs">{metric.label}</span>
                    <Icon className="h-3 w-3 text-white/25 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <p className="mt-2 text-base font-medium tracking-[-0.03em] text-white sm:mt-3 sm:text-xl">{metric.value}</p>
                  <p className="mt-0.5 text-[10px] text-white/30 sm:mt-1 sm:text-xs">{metric.note}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-2 rounded-xl border border-white/[0.07] bg-[#0C0C0C] p-3 sm:mt-3 sm:rounded-2xl sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CCFF00] sm:h-4 sm:w-4" />
              <p className="text-xs leading-relaxed text-white/45 sm:text-sm">
                Keep the final repeat controlled. Your long-run load is trending high this week.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
);


const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  
  const handleLogin = () => {
    if(isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/strava`;
    }
  };
  
  return (
    <section
      className="relative overflow-hidden border-b border-[#181818] pt-32 sm:pt-32 lg:pt-36"
      aria-labelledby="hero-title"
    >
      <HeroBackground />
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-white/45 transition-colors duration-300 hover:border-white/[0.14] hover:text-white/70 sm:px-5 sm:py-2 sm:text-sm">
            <StravaLogo className="h-3 w-auto sm:h-3.5" />
            <span className="h-3 w-px bg-white/[0.08] sm:h-3.5" />
            From your Strava data
          </div>

          <h1 id="hero-title" className="mt-5 max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-white sm:mt-6 sm:text-5xl lg:text-6xl">
            Performance intelligence
            <br />
            for every run.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/45 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
            Endurio analyzes your Strava history to build training that adapts to your actual fitness.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-7 sm:flex-row">
            <button onClick={handleLogin} className="cursor-pointer group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 sm:px-6 sm:py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {isAuthenticated ? "Go to Dashboard" : "Connect Strava"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
            </button>
            <a href="#coach" className="rounded-full border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-white/62 transition hover:border-white/25 hover:text-white sm:px-6 sm:py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              See the workflow
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-white/30 sm:mt-7 sm:gap-x-5 sm:text-sm">
            <span>AI-powered analysis</span>
            <span className="h-1 w-1 rounded-full bg-white/18" />
            <span>Adaptive training plans</span>
            <span className="h-1 w-1 rounded-full bg-white/18" />
            <span>Recovery-aware scheduling</span>
          </div>
        </div>

        {/* Mobile preview */}
        <div className="mt-10 pb-16 sm:hidden">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0A]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <span className="text-sm font-medium text-white">Next workout</span>
              <span className="rounded-full border border-[#CCFF00]/25 px-3 py-1 text-xs font-medium text-[#CCFF00]">
                82% ready
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-medium text-white">Tempo session</h3>
                <span className="text-xs text-white/35">Week 7 of 12</span>
              </div>
              <div className="mt-4 divide-y divide-white/[0.07]">
                {plan.map((item) => (
                  <div key={item.day} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/35 w-7">{item.day}</span>
                      <div>
                        <p className="text-sm font-medium text-white/85">{item.title}</p>
                        <p className="text-[11px] text-white/35">{item.detail}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                        item.active
                          ? "border-[#CCFF00]/25 text-[#CCFF00]"
                          : "border-white/[0.08] text-white/35"
                      }`}
                    >
                      {item.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.07] px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-white/25" />
                  <span className="text-xs text-white/35">Recovery <strong className="text-white/70">82%</strong></span>
                </div>
                <span className="text-xs text-white/35">Load <strong className="text-white/70">76</strong></span>
                <span className="text-xs text-white/35">Pace <strong className="text-white/70">4:38</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop full dashboard */}
        <div className="mt-10 hidden pb-24 sm:mt-14 sm:block sm:pb-28 lg:pb-36">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
};

export default Hero;
