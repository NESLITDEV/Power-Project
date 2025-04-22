import { useState, useEffect } from "react";
import { UtilityDistribution, SummarySection } from "./blocks";
import { KeenIcon } from "@/components/keenicons";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { FormattedMessage } from "react-intl";
import UtilityPieChart from "./blocks/UtilityPieChart";

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
      },
      {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
      },
      {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-600 dark:text-yellow-400",
      },
      {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
      },
      {
        bg: "bg-indigo-100 dark:bg-indigo-900/20",
        text: "text-indigo-600 dark:text-indigo-400",
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= expenseTypes.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? expenseTypes.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Channel Stats Section with Carousel */}
      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
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
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1️⃣ Total Cost */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <KeenIcon
                          icon="dollar"
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        <FormattedMessage id="DASHBOARD.TOTAL_COST" />
                      </h3>
                    </div>
                    <span className="text-sm text-yellow-500 font-medium">
                      <FormattedMessage id="DASHBOARD.ALL_TYPES" />
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${totalCost.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <FormattedMessage id="DASHBOARD.TOTAL_EXPENSES" />
                    </p>
                  </div>
                </div>

                {/* 2️⃣ Expense Type - ONLY ONE DISPLAYED AT A TIME */}
                {expenseTypes.length > 0 &&
                  (() => {
                    const expenseType = expenseTypes[currentSlide]; // ✅ Direct access
                    if (!expenseType) return null;

                    const stats = getUtilityStats(expenseType);
                    const colorClasses = getIconColorClasses(currentSlide);

                    return (
                      <div
                        key={expenseType}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 flex items-center justify-center ${colorClasses.bg} rounded-lg`}
                            >
                              <KeenIcon
                                icon="electricity"
                                className={colorClasses.text}
                              />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {expenseType}
                            </h3>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              stats.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {stats.change > 0 ? "+" : ""}
                            {stats.change.toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.quantity.toLocaleString()}{" "}
                            {getUnit(expenseType)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <FormattedMessage id="DASHBOARD.MONTHLY_CONSUMPTION" />
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                {/* 3️⃣ Pie Chart */}
                {expenseTypes.length > 0 && (
                  <UtilityPieChart expenses={expenses} />
                )}
              </div>
            </div>

            {/* ⏩ Carousel Controls (only if more than 1) */}
            {expenseTypes.length > 1 && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={prevSlide}
                  className="btn btn-icon btn-light btn-sm"
                >
                  <KeenIcon icon="arrow-left" />
                </button>
                <div className="flex space-x-2">
                  {Array.from({ length: expenseTypes.length }).map(
                    (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentSlide === index
                            ? "bg-primary"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    )
                  )}
                </div>
                <button
                  onClick={nextSlide}
                  className="btn btn-icon btn-light btn-sm"
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
