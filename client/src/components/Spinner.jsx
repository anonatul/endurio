export default function Spinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full border-2 border-white/10 border-t-white"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
