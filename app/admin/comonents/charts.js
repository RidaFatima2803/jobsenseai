import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Charts({ data }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="featureName" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="_sum.usageCount" />
    </BarChart>
  );
}
