"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const AXIS = "#ffffff";
const SUB = "#d1d5db";
const GRID = "#2a2a2a";

const card =
  "rounded-2xl border border-zinc-800 bg-[#0b0b0b] p-6";

const title =
  "text-2xl font-semibold text-white";

const subtitle =
  "text-base text-gray-300 mt-2";

export function RegistrationChart({ data }) {
  return (
    <div className={card}>
      <h2 className={title}>
        User Registrations
      </h2>

      <p className={subtitle}>
        New sign-ups over the last 30 days
      </p>

      <ResponsiveContainer
        width="100%"
        height={260}
      >
        <LineChart data={data}>
          <CartesianGrid
            stroke={GRID}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: AXIS }}
            axisLine={{ stroke: AXIS }}
          />

          <YAxis
            tick={{ fill: AXIS }}
            axisLine={{ stroke: AXIS }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="users"
            stroke="#6366f1"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FeatureUsageChart({ data }) {
  const colors = [
    "#6366f1", // Resumes (purple)
    "#06b6d4", // Cover Letters (cyan)
    "#a855f7", // Interviews (violet)
  ];

  const coloredData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  return (
    <div className={card}>
      <h2 className={title}>
        Feature Usage
      </h2>

      <p className={subtitle}>
        Total generations by feature
      </p>

      <ResponsiveContainer
        width="100%"
        height={260}
      >
        <BarChart
          layout="vertical"
          data={coloredData}
        >
          <XAxis
            type="number"
            tick={{ fill: "#ffffff" }}
            axisLine={{
              stroke: "#ffffff",
            }}
          />

          <YAxis
            type="category"
            dataKey="feature"
            width={120}
            tick={{
              fill: "#ffffff",
            }}
            axisLine={{
              stroke: "#ffffff",
            }}
          />

          <Tooltip
            contentStyle={{
              background: "#111",
              border: "1px solid #333",
              color: "#fff",
            }}
          />

          <Bar
            dataKey="count"
            radius={[8, 8, 8, 8]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityChart({
  data,
}) {
  return (
    <div className={card}>
      <h2 className={title}>
        Daily Activity
      </h2>

      <p className={subtitle}>
        Documents generated per day
        (last 30 days)
      </p>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <AreaChart data={data}>
          <CartesianGrid
            stroke={GRID}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: AXIS }}
            axisLine={{ stroke: AXIS }}
          />

          <YAxis
            tick={{ fill: AXIS }}
            axisLine={{ stroke: AXIS }}
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="activity"
            stroke="#00d4ff"
            fill="#00d4ff22"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}