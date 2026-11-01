/** Fixed, slowly twinkling star field behind every page. Pure CSS; static under reduced motion. */
export default function Sky() {
  return (
    <div aria-hidden className="sky no-print">
      <div className="sky-layer sky-a" />
      <div className="sky-layer sky-b" />
      <div className="sky-layer sky-c" />
    </div>
  );
}
