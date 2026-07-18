export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
      <div
        className={[
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]",
          "bg-[size:14px_24px]",
          "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]",
          "[-webkit-mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]",
          "[mask-repeat:no-repeat]",
          "[-webkit-mask-repeat:no-repeat]",
        ].join(" ")}
      />
    </div>
  );
}
