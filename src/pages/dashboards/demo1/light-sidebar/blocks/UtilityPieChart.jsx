import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pie } from "react-chartjs-2";
import { format } from "date-fns";

// Custom CSS for dark mode
const darkModeStyles = `
  .dark .pie-input {
    background-color: #26272F !important;
    border-color: #363843 !important;
    color: #F5F5F5 !important;
  }
  
  .dark .pie-content {
    background-color: #1F2129 !important;
    border-color: #363843 !important;
  }
`;

const generateColors = (index) => {
  const palettes = [
    { main: "rgb(45, 94, 255)", light: "rgba(45, 94, 255, 0.7)" },
    { main: "rgb(255, 77, 109)", light: "rgba(255, 77, 109, 0.7)" },
    { main: "rgb(0, 210, 122)", light: "rgba(0, 210, 122, 0.7)" },
    { main: "rgb(192, 70, 255)", light: "rgba(192, 70, 255, 0.7)" },
    { main: "rgb(255, 168, 0)", light: "rgba(255, 168, 0, 0.7)" },
    { main: "rgb(255, 64, 212)", light: "rgba(255, 64, 212, 0.7)" },
    { main: "rgb(0, 208, 206)", light: "rgba(0, 208, 206, 0.7)" },
    { main: "rgb(255, 126, 34)", light: "rgba(255, 126, 34, 0.7)" },
    { main: "rgb(99, 122, 255)", light: "rgba(99, 122, 255, 0.7)" },
    { main: "rgb(255, 45, 85)", light: "rgba(255, 45, 85, 0.7)" },
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

  // Check if there's no data
  const data = getFilteredData();
  const hasNoData = data.labels.length === 0;

  // Always render the dropdown and time selector
  const timeRangeSelector = (
    <div className="flex justify-end mb-2">
      <Select value={pieTimeRange} onValueChange={setPieTimeRange}>
        <SelectTrigger className="w-36 h-9 text-sm pie-input">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent className="pie-content">
          <SelectItem value="day">Daily</SelectItem>
          <SelectItem value="7days">Last 7 Days</SelectItem>
          <SelectItem value="month">Monthly</SelectItem>
          <SelectItem value="6months">Last 6 Months</SelectItem>
          <SelectItem value="year">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="w-full">
      <style>{darkModeStyles}</style>
      {timeRangeSelector}

      {hasNoData ? (
        <div className="h-[215px] sm:h-[230px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data found for the selected time range
        </div>
      ) : (
        <div className="h-[215px] sm:h-[230px] flex items-center justify-center">
          <Pie data={data} options={pieOptions} />
        </div>
      )}
    </div>
  );
};

export default UtilityPieChart;
