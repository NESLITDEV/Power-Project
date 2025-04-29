import { useState, useEffect } from "react";
import { UtilityDistribution, SummarySection } from "./blocks";
import { KeenIcon } from "@/components/keenicons";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { FormattedMessage } from "react-intl";
import UtilityPieChart from "./blocks/UtilityPieChart";

// Custom CSS for dark mode
const darkModeStyles = `
  .dark .dashboard-card {
    background-color: #1F2129 !important;
    border-color: #363843 !important;
  }
  
  .dark .dashboard-text-high {
    color: #F5F5F5 !important;
  }
  
  .dark .dashboard-text-medium {
    color: #B5B7C8 !important;
  }
  
  .dark .dashboard-highlight {
    background-color: #26272F !important;
    border-color: #363843 !important;
  }
  
  .dark .dashboard-button {
    border-color: #363843 !important;
  }
  
  .dark .dashboard-border {
    border-color: #363843 !important;
  }
`;

const Demo1LightSidebarContent = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses
        const expensesResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/user-expenses/${auth.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        setExpenses(expensesResponse.data);

        // Get unique expense types from the expenses
        const uniqueTypes = [
          ...new Set(
            expensesResponse.data.map((expense) => expense.expenseTypeName)
          ),
        ];
        setExpenseTypes(uniqueTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.id) {
      fetchData();
    }
  }, [auth?.id, auth?.token]);

  // Calculate statistics for each utility type
  const getUtilityStats = (expenseTypeName) => {
    const utilityExpenses = expenses.filter(
      (expense) => expense.expenseTypeName === expenseTypeName
    );

    if (utilityExpenses.length === 0) return { quantity: 0, change: 0 };

    const totalQuantity = utilityExpenses.reduce(
      (sum, expense) => sum + expense.quantity,
      0
    );

    // Calculate change percentage (using the last two entries)
    const sortedExpenses = [...utilityExpenses].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    let change = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].quantity;
      const previous = sortedExpenses[1].quantity;
      change = ((current - previous) / previous) * 100;
    }

    return {
      quantity: totalQuantity,
      change: change,
    };
  };

  // Calculate total cost
  const totalCost = expenses.reduce(
    (sum, expense) => sum + expense.totalCost,
    0
  );

  // Get icon color based on expense type
  const getIconColorClasses = (index) => {
    const colors = [
      {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        accent: "border-blue-500",
        highlight: "bg-blue-50 dark:bg-blue-900/10",
        light: "text-blue-500",
      },
      {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
        accent: "border-green-500",
        highlight: "bg-green-50 dark:bg-green-900/10",
        light: "text-green-500",
      },
      {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-600 dark:text-yellow-400",
        accent: "border-yellow-500",
        highlight: "bg-yellow-50 dark:bg-yellow-900/10",
        light: "text-yellow-500",
      },
      {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        accent: "border-red-500",
        highlight: "bg-red-50 dark:bg-red-900/10",
        light: "text-red-500",
      },
      {
        bg: "bg-indigo-100 dark:bg-indigo-900/20",
        text: "text-indigo-600 dark:text-indigo-400",
        accent: "border-indigo-500",
        highlight: "bg-indigo-50 dark:bg-indigo-900/10",
        light: "text-indigo-500",
      },
    ];
    return colors[index % colors.length];
  };

  // Get unit based on expense type
  const getUnit = (expenseType) => {
    const units = {
      Electricity: "kWh",
      Gas: "m³",
      Water: "m³",
      Fuel: "L",
    };
    return units[expenseType] || "units";
  };

  // Get detailed stats for summary section
  const getDetailedStats = (expenseTypeName) => {
    const utilityExpenses = expenses.filter(
      (expense) => expense.expenseTypeName === expenseTypeName
    );

    if (utilityExpenses.length === 0) {
      return {
        currentUsage: 0,
        average: 0,
        change: 0,
        unit: getUnit(expenseTypeName),
      };
    }

    // Sort expenses by date
    const sortedExpenses = [...utilityExpenses].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    // Get current usage (most recent)
    const currentUsage = sortedExpenses[0].quantity;

    // Calculate average
    const average =
      utilityExpenses.reduce((sum, expense) => sum + expense.quantity, 0) /
      utilityExpenses.length;

    // Calculate change percentage
    let change = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].quantity;
      const previous = sortedExpenses[1].quantity;
      change = ((current - previous) / previous) * 100;
    }

    return {
      currentUsage,
      average,
      change,
      unit: getUnit(expenseTypeName),
    };
  };

  // Get detailed stats for expense cards
  const getCardStats = (expenseTypeName) => {
    const utilityExpenses = expenses.filter(
      (expense) => expense.expenseTypeName === expenseTypeName
    );

    if (utilityExpenses.length === 0) {
      return {
        avgCost: 0,
        totalCost: 0,
        quantity: 0,
        change: 0,
        costChange: 0,
        lastReading: "N/A",
        lastUpdate: "N/A",
      };
    }

    // Sort expenses by date
    const sortedExpenses = [...utilityExpenses].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    // Calculate total cost for this expense type
    const totalCost = utilityExpenses.reduce(
      (sum, expense) => sum + expense.totalCost,
      0
    );

    // Calculate average cost per unit
    const avgCost =
      totalCost /
      utilityExpenses.reduce((sum, expense) => sum + expense.quantity, 0);

    // Calculate consumption change
    let change = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].quantity;
      const previous = sortedExpenses[1].quantity;
      change = ((current - previous) / previous) * 100;
    }

    // Calculate cost change
    let costChange = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].totalCost;
      const previous = sortedExpenses[1].totalCost;
      costChange = ((current - previous) / previous) * 100;
    }

    // Format the last update date
    const lastUpdate = sortedExpenses[0]?.createdDate
      ? new Date(sortedExpenses[0].createdDate).toLocaleDateString()
      : "N/A";

    // Total quantity
    const quantity = utilityExpenses.reduce(
      (sum, expense) => sum + expense.quantity,
      0
    );

    return {
      avgCost,
      totalCost,
      quantity,
      change,
      costChange,
      lastReading:
        sortedExpenses[0]?.quantity?.toLocaleString() +
        " " +
        getUnit(expenseTypeName),
      lastUpdate,
    };
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      // If we're at the last or second-to-last item, wrap back to 0
      if (prev >= expenseTypes.length - 2) {
        return 0;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      // If we're at the first item, wrap to the appropriate position for the last item
      if (prev <= 0) {
        // If odd number of types, go to second-to-last, else go to last
        return expenseTypes.length % 2 === 0
          ? expenseTypes.length - 2
          : expenseTypes.length - 1;
      }
      return prev - 1;
    });
  };

  return (
    <div className="space-y-6">
      <style>{darkModeStyles}</style>
      {/* Channel Stats Section with Carousel */}
      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse dashboard-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 🧮 Fixed: Total + Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-start">
              <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 dashboard-card">
                <div className="h-[280px] w-full">
                  <UtilityPieChart expenses={expenses} />
                </div>
              </div>
              {/* 🧮 Total Cost */}
              <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col justify-between min-h-[280px] border-2 border-purple-300 dark:border-purple-800 dashboard-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <KeenIcon
                        icon="dollar"
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 dashboard-text-high">
                      {/* <FormattedMessage id="DASHBOARD.TOTAL_COST" /> */}
                      Total Cost
                    </h3>
                  </div>
                  <span className="text-sm text-purple-500 font-medium">
                    <FormattedMessage id="DASHBOARD.ALL_TYPES" />
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 dashboard-text-high">
                  ${totalCost.toLocaleString()}
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-md p-2 mt-3 mb-2 dashboard-highlight">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Total Expenses:
                    </span>
                    <span className="text-sm font-bold dashboard-text-high">
                      {expenses.length}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 dashboard-text-medium">
                  Last Update:{" "}
                  {expenses.length > 0
                    ? new Date(
                        Math.max(
                          ...expenses.map((e) => new Date(e.createdDate))
                        )
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* 💸 Expense Cards */}
              {expenseTypes
                .slice(currentSlide, currentSlide + 2)
                .map((expenseType, index) => {
                  const stats = getUtilityStats(expenseType);
                  const detailedStats = getCardStats(expenseType);
                  const colorClasses = getIconColorClasses(index);
                  return (
                    <div
                      key={expenseType}
                      className={`col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-all duration-200 hover:shadow-md min-h-[280px] flex flex-col justify-between border-2 ${colorClasses.accent} dashboard-card`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 flex items-center justify-center ${colorClasses.bg} rounded-lg`}
                            >
                              <KeenIcon
                                icon="electricity"
                                className={colorClasses.text}
                              />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 dashboard-text-high">
                              {expenseType}
                            </h3>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              detailedStats.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {detailedStats.change > 0 ? "+" : ""}
                            {detailedStats.change.toFixed(
                              1
                            )}%
                          </span>
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 dashboard-text-high">
                          {detailedStats.quantity.toLocaleString()}{" "}
                          {getUnit(expenseType)}
                        </div>

                        <div
                          className={`text-xs rounded-md p-2 mb-3 ${colorClasses.highlight} flex items-center justify-between dashboard-highlight`}
                        >
                          <span className="font-medium">Total Cost:</span>
                          <span className="font-bold dashboard-text-high">
                            $
                            {detailedStats.totalCost.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400 dashboard-text-medium">
                              Avg. Cost:
                            </span>
                            <span
                              className={`font-medium ${colorClasses.light}`}
                            >
                              $
                              {detailedStats.avgCost.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                              /{getUnit(expenseType)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400 dashboard-text-medium">
                              Last Reading:
                            </span>
                            <span className="font-medium dashboard-text-high">
                              {detailedStats.lastReading}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 flex justify-between text-xs dashboard-border">
                          <span className="text-gray-500 dark:text-gray-400 dashboard-text-medium">
                            Last Update:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 dashboard-text-medium">
                            {detailedStats.lastUpdate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* ⏩ Carousel Controls */}
            {expenseTypes.length > 2 && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={prevSlide}
                  className="btn btn-icon btn-light btn-sm dashboard-button"
                >
                  <KeenIcon icon="arrow-left" />
                </button>
                <div className="flex space-x-2">
                  {Array.from({
                    length: expenseTypes.length - 1,
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentSlide === index ||
                        // Special case for the last dot
                        (index === expenseTypes.length - 2 &&
                          currentSlide === expenseTypes.length - 1)
                          ? "bg-primary"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="btn btn-icon btn-light btn-sm dashboard-button"
                >
                  <KeenIcon icon="arrow-right" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <FormattedMessage id="DASHBOARD.PEAK_HOURS_ALERT" />
            </h3>
            <KeenIcon icon="notification-bing" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            <FormattedMessage id="DASHBOARD.HIGH_CONSUMPTION_ALERT" />
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            <FormattedMessage id="DASHBOARD.VIEW_DETAILS" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <FormattedMessage id="DASHBOARD.ENERGY_SAVINGS" />
            </h3>
            <KeenIcon icon="shield-tick" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            <FormattedMessage id="DASHBOARD.ELECTRICITY_SAVINGS" />
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            <FormattedMessage id="DASHBOARD.SEE_HOW" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <FormattedMessage id="DASHBOARD.SMART_TIPS" />
            </h3>
            <KeenIcon icon="bulb" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            <FormattedMessage id="DASHBOARD.RECOMMENDATIONS" />
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            <FormattedMessage id="DASHBOARD.LEARN_MORE" />
          </button>
        </div>
      </div>

      {/* Utility Distribution Chart */}
      <UtilityDistribution />

      {/* Summary Section */}
      <SummarySection
        loading={loading}
        expenseTypes={expenseTypes}
        totalCost={totalCost}
        expenses={expenses}
        getDetailedStats={getDetailedStats}
      />
    </div>
  );
};

export { Demo1LightSidebarContent };
