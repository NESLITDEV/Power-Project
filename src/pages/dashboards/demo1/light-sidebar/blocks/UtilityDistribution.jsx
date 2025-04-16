import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement,
  Filler,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { format } from "date-fns";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

const UtilityDistribution = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [pieTimeRange, setPieTimeRange] = useState("month");
  const [selectedType, setSelectedType] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const { auth } = useAuthContext();

  const generateColors = (index) => {
    const colorPalettes = [
      {
        main: "rgb(56, 189, 248)",
        light: "rgba(56, 189, 248, 0.5)",
      },
      {
        main: "rgb(244, 63, 94)",
        light: "rgba(244, 63, 94, 0.5)",
      },
      {
        main: "rgb(16, 185, 129)",
        light: "rgba(16, 185, 129, 0.5)",
      },
      {
        main: "rgb(168, 85, 247)",
        light: "rgba(168, 85, 247, 0.5)",
      },
      {
        main: "rgb(245, 158, 11)",
        light: "rgba(245, 158, 11, 0.5)",
      },
    ];
    return colorPalettes[index % colorPalettes.length];
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/user-expenses/${auth.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        setExpenses(response.data);
        const types = [...new Set(response.data.map((e) => e.expenseTypeName))];
        setExpenseTypes(types);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    if (auth?.id) fetchExpenses();
  }, [auth?.id, auth?.token]);

  // ⛔️ Commented out Pie Chart logic for future use
  // const getCollectiveData = () => {
  //   const typeData = {};
  //   const now = new Date();
  //   let cutoff = new Date();

  //   switch (pieTimeRange) {
  //     case "day":
  //       cutoff.setDate(now.getDate() - 1);
  //       break;
  //     case "7days":
  //       cutoff.setDate(now.getDate() - 7);
  //       break;
  //     case "month":
  //       cutoff.setMonth(now.getMonth() - 1);
  //       break;
  //     case "6months":
  //       cutoff.setMonth(now.getMonth() - 6);
  //       break;
  //     case "year":
  //       cutoff.setFullYear(now.getFullYear() - 1);
  //       break;
  //   }

  //   const filtered = expenses.filter(
  //     (e) => new Date(e.expenseForDate) >= cutoff
  //   );

  //   filtered.forEach((e) => {
  //     if (!typeData[e.expenseTypeName]) {
  //       typeData[e.expenseTypeName] = 0;
  //     }
  //     typeData[e.expenseTypeName] += e.totalCost;
  //   });

  //   return {
  //     labels: Object.keys(typeData),
  //     datasets: [
  //       {
  //         data: Object.values(typeData),
  //         backgroundColor: Object.keys(typeData).map((_, i) => generateColors(i).light),
  //         borderColor: Object.keys(typeData).map((_, i) => generateColors(i).main),
  //         borderWidth: 2,
  //         hoverBorderWidth: 4,
  //         hoverOffset: 15,
  //         borderRadius: 3,
  //       },
  //     ],
  //   };
  // };

  const getChartData = () => {
    const cutoffDate = new Date();
    switch (timeRange) {
      case "day":
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case "7days":
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case "6months":
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case "year":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
    }

    const filtered = expenses.filter(
      (e) => new Date(e.expenseForDate) >= cutoffDate
    );
    const allDates = [
      ...new Set(
        filtered.map((e) =>
          format(
            new Date(e.expenseForDate),
            timeRange === "year" || timeRange === "6months" ? "MM" : "MM/dd"
          )
        )
      ),
    ];

    const datasets = expenseTypes.map((type, index) => {
      const typeExpenses = filtered.filter((e) => e.expenseTypeName === type);
      const colors = generateColors(index);
      return {
        label: type,
        data: allDates.map((label) =>
          typeExpenses
            .filter(
              (e) =>
                format(
                  new Date(e.expenseForDate),
                  timeRange === "year" || timeRange === "6months"
                    ? "MM"
                    : "MM/dd"
                ) === label
            )
            .reduce((sum, e) => sum + e.quantity, 0)
        ),
        borderColor: colors.main,
        backgroundColor: colors.light,
        fill: chartType === "area",
        tension: 0.4,
      };
    });

    return { labels: allDates.sort(), datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 13, family: "Inter", weight: "500" },
        },
      },
      title: {
        display: true,
        text:
          selectedType === "all"
            ? "All Types Consumption Over Time"
            : `${selectedType} Consumption Over Time`,
        font: { size: 16, family: "Inter", weight: "600" },
        padding: { bottom: 25 },
        color: "#374151",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12 }, padding: 8 },
        title: {
          display: true,
          text: "Quantity",
          font: { size: 13, weight: "500" },
        },
      },
      x: {
        ticks: { font: { size: 12 }, padding: 8 },
        title: {
          display: true,
          text: "Date",
          font: { size: 13, weight: "500" },
        },
      },
    },
  };

  const renderChart = () => {
    const data = getChartData();
    return chartType === "bar" ? (
      <Bar data={data} options={chartOptions} />
    ) : (
      <Line data={data} options={chartOptions} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Pie Chart Card - commented out for now */}
      {/* <Card className="p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Overall Utility Distribution</h3>
          <Select value={pieTimeRange} onValueChange={setPieTimeRange}>
            <SelectTrigger className="w-40">
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
        <div className="h-[400px] flex items-center justify-center">
          <Pie data={getCollectiveData()} options={pieOptions} />
        </div>
      </Card> */}

      {/* Line/Bar Chart */}
      <Card className="p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Individual Utility Consumption
          </h3>
          <div className="flex gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {expenseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
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
        </div>
        <div className="h-[400px] flex items-center justify-center">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
};

export { UtilityDistribution };