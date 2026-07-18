const RoutePath = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full select-none"
    viewBox="0 0 1440 200"
    fill="none"
    preserveAspectRatio="none"
  >
    <path
      d="M0 160 Q 120 80 240 120 T 480 60 T 720 130 T 960 50 T 1200 110 T 1440 70"
      stroke="url(#route-grad)"
      strokeWidth="0.5"
      vectorEffect="non-scaling-stroke"
    />
    {[240, 480, 720, 960, 1200].map((x, i) => (
      <circle key={i} cx={x} cy={[120, 60, 130, 50, 110][i]} r="1.5" fill="url(#route-grad)" opacity="0.15" />
    ))}
    <defs>
      <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="20%" stopColor="#CCFF00" stopOpacity="0.04" />
        <stop offset="50%" stopColor="#CCFF00" stopOpacity="0.06" />
        <stop offset="80%" stopColor="#CCFF00" stopOpacity="0.04" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-[#181818] bg-[#0B0B0B]">
    <RoutePath />

    <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 transition duration-300 hover:text-white/60">
            Endurio
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/15">
            Performance intelligence for runners who want to train smarter, recover better, and go further.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <a href="#" className="text-sm text-white/20 transition duration-300 hover:text-white/50">GitHub</a>
          <a href="#" className="text-sm text-white/20 transition duration-300 hover:text-white/50">Twitter</a>
          <a href="#" className="text-sm text-white/20 transition duration-300 hover:text-white/50">Strava</a>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#181818] pt-6 sm:flex-row">
        <p className="text-xs text-white/10">&copy; 2026 Endurio</p>
        <p className="text-xs text-white/10">built for the long run</p>
      </div>
    </div>
  </footer>
);

export default Footer;
