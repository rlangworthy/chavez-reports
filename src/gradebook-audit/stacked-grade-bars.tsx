// charts/StackedGradeBars.tsx
import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

type Datum = {
  name: string;
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
  graded: number;
  weight?: number; // percent assignment weight
};

const MultiLineTick = (props: {
  x?: number;
  y?: number;
  payload?: { value: string | number };
}) => {
  const { x = 0, y = 0, payload = { value: "" } } = props;
  const wrap = (text: string, max = 14) => {
    const words = String(text).split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length > max) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const lines = wrap(String(payload.value), 14);
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle">
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// custom label that uses payload.weight
const WeightLabel: React.FC<any> = ({ x, y, width, payload }) => {
  if (payload?.weight == null) return null;
  const text = `${Math.round(payload.weight)}%`;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fill="#34495e"
      style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
    >
      {text}
    </text>
  );
};

export function StackedGradeBars({
  data,
  title,
  minWidth = 540,
  maxWidth = 1080,
  height = 240,
}: {
  data: Datum[];
  title: string;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
}) {
  const barCount = Math.max(1, data?.length ?? 0);
  const perBar = 120;
  const computedWidth = Math.min(
    maxWidth,
    Math.max(minWidth, barCount * perBar)
  );

  return (
    <div style={{ width: "100%", margin: "10px 0 8px" }}>
      <div style={{ fontWeight: 600, marginBottom: 6, textAlign: "center" }}>
        {title}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <BarChart
          width={computedWidth}
          height={height}
          data={data}
          margin={{ top: 12, right: 12, left: 12, bottom: 36 }}
          barCategoryGap="18%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            tick={<MultiLineTick />}
            tickLine={false}
            tickMargin={6}
            height={52}
          />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={44} />
          <Tooltip
            formatter={(v: number, k) =>
              k === "graded" ? v : `${v.toFixed(1)}%`
            }
          />

          {/* flipped order: F bottom → A top */}
          <Bar dataKey="F" stackId="g" fill="#e74c3c" name="% F" />
          <Bar dataKey="D" stackId="g" fill="#e67e22" name="% D" />
          <Bar dataKey="C" stackId="g" fill="#f1c40f" name="% C" />
          <Bar dataKey="B" stackId="g" fill="#3498db" name="% B" />
          <Bar dataKey="A" stackId="g" fill="#2ecc71" name="% A">
            <LabelList content={<WeightLabel />} />
          </Bar>

          <Bar
            dataKey="graded"
            stackId="tooltipOnly"
            fill="transparent"
            name="# Graded"
          />
        </BarChart>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          marginTop: 6,
          fontSize: 12,
        }}
      >
        {[
          { label: "% A", color: "#2ecc71" },
          { label: "% B", color: "#3498db" },
          { label: "% C", color: "#f1c40f" },
          { label: "% D", color: "#e67e22" },
          { label: "% F", color: "#e74c3c" },
        ].map((item) => (
          <span
            key={item.label}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: item.color,
                display: "inline-block",
                marginRight: 6,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
