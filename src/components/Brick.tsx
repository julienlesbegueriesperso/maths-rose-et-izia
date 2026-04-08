import { darken } from "../utils";

interface BrickProps {
  color: string;
  delayIdx?: number;
}

export function Brick({ color, delayIdx }: BrickProps) {
  const s = darken(color, 22);
  const style: React.CSSProperties = {
    ["--c" as any]: color,
    ["--s" as any]: s,
    ...(delayIdx !== undefined
      ? { ["--d" as any]: `${(delayIdx * 0.04).toFixed(2)}s` }
      : {}),
  };

  return (
    <div className="brick" style={style}>
      <div className="stud"></div>
    </div>
  );
}

interface BrickRowProps {
  count: number;
  color: string;
  startIdx?: number;
}

export function BrickRow({ count, color, startIdx }: BrickRowProps) {
  const si = startIdx || 0;
  return (
    <div className="brick-row">
      {Array.from({ length: count }, (_, i) => (
        <Brick key={i} color={color} delayIdx={si + i} />
      ))}
    </div>
  );
}
