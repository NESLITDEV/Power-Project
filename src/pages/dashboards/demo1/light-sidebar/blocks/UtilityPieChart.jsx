import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pie } from "react-chartjs-2";
import { format } from "date-fns";

// Color palette generator
const generateColors = (index) => {
  const palettes = [
    { main: "rgb(56, 189, 248)", light: "rgba(56, 189, 248, 0.5)" },
    { main: "rgb(244, 63, 94)", light: "rgba(244, 63, 94, 0.5)" },
    { main: "rgb(16, 185, 129)", light: "rgba(16, 185, 129, 0.5)" },
    { main: "rgb(168, 85, 247)", light: "rgba(168, 85, 247, 0.5)" },
    { main: "rgb(245, 158, 11)", light: "rgba(245, 158, 11, 0.5)" },
    { main: "rgb(236, 72, 153)", light: "rgba(236, 72, 153, 0.5)" },
    { main: "rgb(20, 184, 166)", light: "rgba(20, 184, 166, 0.5)" },
    { main: "rgb(234, 88, 12)", light: "rgba(234, 88, 12, 0.5)" },
    { main: "rgb(99, 102, 241)", light: "rgba(99, 102, 241, 0.5)" },
    { main: "rgb(220, 38, 38)", light: "rgba(220, 38, 38, 0.5)" },
  ];
  return palettes[index % palettes.length];
};

const UtilityPieChart = ({ expenses }) => {
  const [pieTimeRange, setPieTimeRange] = useState("month");

  const getFilteredData = () => {
    const now = new Date();
    let cutoff = new Date();

    switch (pieTimeRange) {
      case "day":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "7days":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "6months":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }

    const filtered = expenses.filter(
      (e) => new Date(e.expenseForDate) >= cutoff
    );

    const typeTotals = {};
    filtered.forEach((e) => {
      typeTotals[e.expenseTypeName] =
        (typeTotals[e.expenseTypeName] || 0) + e.totalCost;
    });

    return {
      labels: Object.keys(typeTotals),
      datasets: [
        {
          data: Object.values(typeTotals),
          backgroundColor: Object.keys(typeTotals).map(
            (_, i) => generateColors(i).light
          ),
          borderColor: Object.keys(typeTotals).map(
            (_, i) => generateColors(i).main
          ),
          borderWidth: 2,
          hoverBorderWidth: 4,
          hoverOffset: 15,
          borderRadius: 3,
        },
      ],
    };
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 10,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            const value = context.parsed.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            });
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
    animation: { animateScale: true, animateRotate: true, duration: 800 },
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Overall Utility Distribution
        </h3>
        <Select value={pieTimeRange} onValueChange={setPieTimeRange}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[180px] sm:h-[200px] flex items-center justify-center">
        <Pie data={getFilteredData()} options={pieOptions} />
      </div>
    </Card>
  );
};

export default UtilityPieChart;
