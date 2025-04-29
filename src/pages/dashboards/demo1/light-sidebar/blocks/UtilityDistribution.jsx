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
import {
  format,
  parseISO,
  isValid,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from "date-fns";

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

  // Enhanced color palette generator with more vibrant colors
  const generateColors = (index) => {
    const colorPalettes = [
      { main: "rgb(45, 94, 255)", light: "rgba(45, 94, 255, 0.7)" }, // Electric Blue
      { main: "rgb(255, 77, 109)", light: "rgba(255, 77, 109, 0.7)" }, // Vivid Crimson
      { main: "rgb(0, 210, 122)", light: "rgba(0, 210, 122, 0.7)" }, // Vibrant Green
      { main: "rgb(192, 70, 255)", light: "rgba(192, 70, 255, 0.7)" }, // Bright Purple
      { main: "rgb(255, 168, 0)", light: "rgba(255, 168, 0, 0.7)" }, // Radiant Orange
      { main: "rgb(255, 64, 212)", light: "rgba(255, 64, 212, 0.7)" }, // Hot Pink
      { main: "rgb(0, 208, 206)", light: "rgba(0, 208, 206, 0.7)" }, // Teal
      { main: "rgb(255, 126, 34)", light: "rgba(255, 126, 34, 0.7)" }, // Sunrise Orange
      { main: "rgb(99, 122, 255)", light: "rgba(99, 122, 255, 0.7)" }, // Periwinkle Blue
      { main: "rgb(255, 45, 85)", light: "rgba(255, 45, 85, 0.7)" }, // Bright Red
      { main: "rgb(141, 255, 96)", light: "rgba(141, 255, 96, 0.7)" }, // Lime Green
      { main: "rgb(126, 87, 255)", light: "rgba(126, 87, 255, 0.7)" }, // Indigo
      { main: "rgb(255, 220, 0)", light: "rgba(255, 220, 0, 0.7)" }, // Golden Yellow
      { main: "rgb(255, 0, 153)", light: "rgba(255, 0, 153, 0.7)" }, // Magenta
      { main: "rgb(0, 255, 179)", light: "rgba(0, 255, 179, 0.7)" }, // Aquamarine
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


        // Normalize the expenses data to extract just the date portion
        const normalizedExpenses = response.data
          .map((expense) => {
            try {
              // Parse the ISO date string
              const dateObj = parseISO(expense.expenseForDate);

              // Format date as YYYY-MM-DD string to remove time component
              const dateOnly = format(dateObj, "yyyy-MM-dd");

              // Return expense with normalized date
              return {
                ...expense,
                // Keep original expenseForDate for reference
                originalExpenseForDate: expense.expenseForDate,
                // Add normalized date (without time component)
                expenseDate: dateOnly,
                // Parse date object for easy comparisons
                expenseDateObj: dateObj,
              };
            } catch (error) {
              console.error("Error processing date:", expense.expenseForDate);
              return null;
            }
          })
          .filter((expense) => expense !== null);

        setExpenses(normalizedExpenses);
        const types = [
          ...new Set(normalizedExpenses.map((e) => e.expenseTypeName)),
        ];
        setExpenseTypes(types);

      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    if (auth?.id) fetchExpenses();
  }, [auth?.id, auth?.token]);

  // Get date range bounds for the selected time filter
  const getDateRangeBounds = () => {
    const today = new Date();
    let startDate;

    switch (timeRange) {
      case "day":
        // Today only
        startDate = startOfDay(today);
        return { startDate, endDate: endOfDay(today) };

      case "7days":
        // Last 7 days
        startDate = startOfDay(subDays(today, 6)); // Start 6 days ago (inclusive of today = 7 days)
        return { startDate, endDate: endOfDay(today) };

      case "month":
        // Last 30 days
        startDate = startOfDay(subDays(today, 29)); // Start 29 days ago (inclusive of today = 30 days)
        return { startDate, endDate: endOfDay(today) };

      case "6months":
        // Last 6 months
        startDate = startOfDay(subMonths(today, 6));
        return { startDate, endDate: endOfDay(today) };

      case "year":
        // Last 365 days
        startDate = startOfDay(subYears(today, 1));
        return { startDate, endDate: endOfDay(today) };

      default:
        // Default to last 30 days
        startDate = startOfDay(subDays(today, 29));
        return { startDate, endDate: endOfDay(today) };
    }
  };

  // Format dates for display on the chart
  const formatDateForDisplay = (dateString) => {
    try {
      const date = parseISO(dateString);

      switch (timeRange) {
        case "day":
        case "7days":
        case "month":
          return format(date, "MM/dd/yyyy");
        case "6months":
        case "year":
          return format(date, "MM/dd/yyyy");
        default:
          return format(date, "MM/dd/yyyy");
      }
    } catch (error) {
      console.error("Error formatting date for display:", dateString, error);
      return dateString || "Invalid Date";
    }
  };

  const getChartData = () => {
    // Get date range for filtering
    const { startDate, endDate } = getDateRangeBounds();

    // Filter expenses by date range
    const filtered = expenses.filter((expense) => {
      const expenseDate = expense.expenseDateObj;
      return expenseDate >= startDate && expenseDate <= endDate;
    });


    // Sort expenses by date
    filtered.sort((a, b) => a.expenseDateObj - b.expenseDateObj);

    // Create an array of unique dates within the range
    const allDates = [...new Set(filtered.map((e) => e.expenseDate))].sort();

    // Format dates for display
    const formattedDates = allDates.map(formatDateForDisplay);

    // If a specific expense type is selected, filter the datasets
    let typesToDisplay = expenseTypes;
    if (selectedType !== "all") {
      typesToDisplay = expenseTypes.filter((type) => type === selectedType);
    }

    const datasets = typesToDisplay.map((type, index) => {
      const typeExpenses = filtered.filter((e) => e.expenseTypeName === type);
      const colors = generateColors(index);

      const dataPoints = allDates.map((dateString) => {
        const matchingExpenses = typeExpenses.filter(
          (e) => e.expenseDate === dateString
        );
        const totalQuantity = matchingExpenses.reduce(
          (sum, e) => sum + e.quantity,
          0
        );
        return totalQuantity;
      });

      return {
        label: type,
        data: dataPoints,
        borderColor: colors.main,
        backgroundColor: colors.light,
        borderWidth: 3,
        pointRadius: 4,
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        fill: chartType === "area",
        tension: 0.4,
      };
    });

    return { labels: formattedDates, datasets };
  };

  // Determine if we need to make the chart scrollable
  const determineScrollable = () => {
    const { startDate, endDate } = getDateRangeBounds();

    // Filter and count unique dates in the date range
    const dateCount = new Set(
      expenses
        .filter(
          (expense) =>
            expense.expenseDateObj >= startDate &&
            expense.expenseDateObj <= endDate
        )
        .map((e) => e.expenseDate)
    ).size;

    // If we have more than 10 dates, enable scrolling
    return dateCount > 10;
  };

  // Calculate the width based on number of data points
  const calculateChartWidth = () => {
    const { startDate, endDate } = getDateRangeBounds();

    // Count unique dates in the range
    const dateCount = new Set(
      expenses
        .filter(
          (expense) =>
            expense.expenseDateObj >= startDate &&
            expense.expenseDateObj <= endDate
        )
        .map((e) => e.expenseDate)
    ).size;

    // For all time ranges, ensure minimum width regardless of data point count
    if (timeRange === "6months" || timeRange === "year") {
      // Use a fixed width for longer time periods to ensure proper display
      return Math.max(1200, dateCount * 45);
    } else if (timeRange === "month") {
      // For 30 days view, ensure a minimum width similar to other views
      return Math.max(1200, dateCount * 45);
    }

    // For shorter time ranges, use the data point based calculation
    return Math.max(1200, dateCount * 45);
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
          padding: 15,
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
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
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
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: { size: 12 },
          padding: 8,
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Date",
          font: { size: 13, weight: "500" },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  // Update options for scrollable charts
  if (determineScrollable()) {
    chartOptions.scales.x.ticks.autoSkip = false;
    chartOptions.scales.x.ticks.maxRotation = 45;
  }

  const renderChart = () => {
    const data = getChartData();

    // Always make the chart scrollable for 6 months and year views
    const shouldForceScroll = timeRange === "6months" || timeRange === "year";
    const isScrollable = shouldForceScroll || determineScrollable();

    const chartWidth = isScrollable ? calculateChartWidth() : "100%";

    // Check if there's no data to display
    const hasNoData =
      data.labels.length === 0 ||
      data.datasets.length === 0 ||
      data.datasets.every((dataset) =>
        dataset.data.every((value) => value === 0)
      );

    if (hasNoData) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] w-full">
          <div className="text-gray-400 text-2xl mb-2">No data found</div>
          <p className="text-gray-500">
            {selectedType === "all"
              ? `No expense data available for the selected time period (${timeRange}).`
              : `No ${selectedType} expense data available for the selected time period (${timeRange}).`}
          </p>
        </div>
      );
    }

    return (
      <div
        className={`${isScrollable ? "overflow-x-auto" : ""} w-full`}
        style={{ minHeight: "400px" }}
      >
        <div style={{ width: chartWidth, height: "400px" }}>
          {chartType === "bar" ? (
            <Bar data={data} options={chartOptions} />
          ) : (
            <Line data={data} options={chartOptions} />
          )}
        </div>
      </div>
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
                <SelectItem value="day">Today Only</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {renderChart()}
      </Card>
    </div>
  );
};

export { UtilityDistribution };
