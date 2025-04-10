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

// Register ChartJS components
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

// Enhanced gradient colors
const createGradient = (ctx, color) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color.light);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  return gradient;
};

const UtilityDistribution = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedType, setSelectedType] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const { auth } = useAuthContext();

  // Enhanced color palette generator with gradients
  const generateColors = (index) => {
    const colorPalettes = [
      {
        main: "rgb(56, 189, 248)", // Sky blue
        light: "rgba(56, 189, 248, 0.5)",
        shadow: "rgba(56, 189, 248, 0.1)",
      },
      {
        main: "rgb(244, 63, 94)", // Rose red
        light: "rgba(244, 63, 94, 0.5)",
        shadow: "rgba(244, 63, 94, 0.1)",
      },
      {
        main: "rgb(16, 185, 129)", // Emerald green
        light: "rgba(16, 185, 129, 0.5)",
        shadow: "rgba(16, 185, 129, 0.1)",
      },
      {
        main: "rgb(168, 85, 247)", // Purple
        light: "rgba(168, 85, 247, 0.5)",
        shadow: "rgba(168, 85, 247, 0.1)",
      },
      {
        main: "rgb(245, 158, 11)", // Amber
        light: "rgba(245, 158, 11, 0.5)",
        shadow: "rgba(245, 158, 11, 0.1)",
      },
      {
        main: "rgb(236, 72, 153)", // Pink
        light: "rgba(236, 72, 153, 0.5)",
        shadow: "rgba(236, 72, 153, 0.1)",
      },
      {
        main: "rgb(20, 184, 166)", // Teal
        light: "rgba(20, 184, 166, 0.5)",
        shadow: "rgba(20, 184, 166, 0.1)",
      },
      {
        main: "rgb(234, 88, 12)", // Orange
        light: "rgba(234, 88, 12, 0.5)",
        shadow: "rgba(234, 88, 12, 0.1)",
      },
      {
        main: "rgb(99, 102, 241)", // Indigo
        light: "rgba(99, 102, 241, 0.5)",
        shadow: "rgba(99, 102, 241, 0.1)",
      },
      {
        main: "rgb(220, 38, 38)", // Red
        light: "rgba(220, 38, 38, 0.5)",
        shadow: "rgba(220, 38, 38, 0.1)",
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

        const types = [
          ...new Set(response.data.map((expense) => expense.expenseTypeName)),
        ];
        setExpenseTypes(types);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    if (auth?.id) {
      fetchExpenses();
    }
  }, [auth?.id, auth?.token]);

  // Enhanced pie chart data
  const getCollectiveData = () => {
    const typeData = {};
    expenses.forEach((expense) => {
      if (!typeData[expense.expenseTypeName]) {
        typeData[expense.expenseTypeName] = 0;
      }
      typeData[expense.expenseTypeName] += expense.totalCost;
    });

    return {
      labels: Object.keys(typeData),
      datasets: [
        {
          data: Object.values(typeData),
          backgroundColor: Object.keys(typeData).map(
            (_, index) => generateColors(index).light
          ),
          borderColor: Object.keys(typeData).map(
            (_, index) => generateColors(index).main
          ),
          borderWidth: 2,
          hoverBorderWidth: 4,
          hoverOffset: 15,
          borderRadius: 3,
        },
      ],
    };
  };

  // Enhanced chart type options
  const getChartTypeOptions = (type, ctx = null, colors = null) => {
    // If colors are not provided or selectedType is 'all', use default colors
    if (!colors || selectedType === "all") {
      colors = {
        main: "rgb(56, 189, 248)", // Default sky blue
        light: "rgba(56, 189, 248, 0.5)",
        shadow: "rgba(56, 189, 248, 0.1)",
      };
    }

    const baseOptions = {
      borderColor: colors.main,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 8,
    };

    switch (type) {
      case "bar":
        return {
          ...baseOptions,
          type: "bar",
          borderRadius: 6,
          borderWidth: 0,
          backgroundColor: colors.light,
          hoverBackgroundColor: colors.main,
          barThickness: 12,
        };
      case "area":
        return {
          ...baseOptions,
          type: "line",
          fill: true,
          backgroundColor: ctx ? createGradient(ctx, colors) : colors.light,
          pointBackgroundColor: colors.main,
          tension: 0.4,
        };
      default: // line
        return {
          ...baseOptions,
          type: "line",
          borderWidth: 3,
          pointBackgroundColor: colors.main,
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointShadowBlur: 10,
          tension: 0.4,
        };
    }
  };

  // Process data for individual or collective charts
  const getChartData = () => {
    const timeRangeFilter = {
      day: 1,
      month: 30,
      year: 365,
    };

    const daysToShow = timeRangeFilter[timeRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

    const filteredByTime = expenses.filter(
      (expense) => new Date(expense.createdDate) >= cutoffDate
    );

    if (selectedType === "all") {
      // Create datasets for all expense types
      const datasets = expenseTypes.map((type, index) => {
        const typeExpenses = filteredByTime
          .filter((expense) => expense.expenseTypeName === type)
          .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));

        const colors = generateColors(index);

        return {
          label: type,
          data: typeExpenses.map((expense) => expense.quantity),
          borderColor: colors.main,
          backgroundColor: colors.light,
          fill: chartType === "area",
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.main,
          pointBorderColor: "white",
          pointBorderWidth: 2,
          // Adjust opacity for area charts to prevent overlapping
          borderWidth: chartType === "area" ? 2 : 3,
        };
      });

      // Get all unique dates for x-axis
      const allDates = [
        ...new Set(
          filteredByTime.map((expense) =>
            format(
              new Date(expense.createdDate),
              timeRange === "day" ? "HH:mm" : "MM/dd"
            )
          )
        ),
      ].sort();

      return {
        labels: allDates,
        datasets,
      };
    } else {
      // Single expense type view
      const filteredExpenses = filteredByTime
        .filter((expense) => expense.expenseTypeName === selectedType)
        .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));

      const typeIndex = expenseTypes.indexOf(selectedType);
      const colors = generateColors(typeIndex);

      return {
        labels: filteredExpenses.map((expense) =>
          format(
            new Date(expense.createdDate),
            timeRange === "day" ? "HH:mm" : "MM/dd"
          )
        ),
        datasets: [
          {
            label: selectedType,
            data: filteredExpenses.map((expense) => expense.quantity),
            borderColor: colors.main,
            backgroundColor: colors.light,
            ...getChartTypeOptions(chartType),
          },
        ],
      };
    }
  };

  // Enhanced pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 13,
            family: "Inter, system-ui, sans-serif",
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600",
          family: "Inter, system-ui, sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "Inter, system-ui, sans-serif",
        },
        callbacks: {
          label: function (context) {
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
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };

  // Enhanced individual chart options
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 13,
            family: "Inter, system-ui, sans-serif",
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600",
          family: "Inter, system-ui, sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "Inter, system-ui, sans-serif",
        },
        displayColors: false,
      },
      title: {
        display: true,
        text:
          selectedType === "all"
            ? "All Types Consumption Over Time"
            : `${selectedType} Consumption Over Time`,
        font: {
          size: 16,
          family: "Inter, system-ui, sans-serif",
          weight: "600",
        },
        padding: { bottom: 25 },
        color: "#374151",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
          padding: 8,
        },
        title: {
          display: true,
          text: "Quantity",
          font: {
            size: 13,
            family: "Inter, system-ui, sans-serif",
            weight: "500",
          },
          padding: { bottom: 10 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
          padding: 8,
        },
        title: {
          display: true,
          text: timeRange === "day" ? "Time" : "Date",
          font: {
            size: 13,
            family: "Inter, system-ui, sans-serif",
            weight: "500",
          },
          padding: { top: 10 },
        },
      },
    },
  });

  const renderChart = () => {
    const data = getChartData();
    if (!data) return null;

    switch (chartType) {
      case "bar":
        return <Bar data={data} options={getChartOptions()} />;
      case "area":
      case "line":
        return (
          <Line
            data={data}
            options={getChartOptions()}
            plugins={[
              {
                id: "gradientFill",
                beforeDraw: (chart) => {
                  if (chartType === "area") {
                    const ctx = chart.ctx;
                    data.datasets.forEach((dataset, index) => {
                      const colors = generateColors(index);
                      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                      gradient.addColorStop(0, colors.light);
                      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                      dataset.backgroundColor = gradient;
                      // Adjust opacity for better visibility in area charts
                      if (selectedType === "all") {
                        dataset.backgroundColor = `rgba(${colors.main
                          .replace(/[^\d,]/g, "")
                          .split(",")
                          .join(", ")}, 0.3)`;
                      }
                    });
                  }
                },
              },
            ]}
          />
        );
      default:
        return <Line data={data} options={getChartOptions()} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg dark:shadow-none hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Overall Utility Distribution
          </h3>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <Pie data={getCollectiveData()} options={pieOptions} />
        </div>
      </Card>

      <Card className="p-6 shadow-lg dark:shadow-none hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
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
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
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
