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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeenIcon } from "@/components/keenicons";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { FormattedMessage } from "react-intl";

const ITEMS_PER_PAGE = 10;

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const { auth } = useAuthContext();

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
        console.log(response.data);
        setFilteredExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.id) {
      fetchExpenses();
    }
  }, [auth?.id, auth?.token]);

  // Apply filters whenever search query, date range, or expense type changes
  useEffect(() => {
    let filtered = [...expenses];

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (expense) => expense.expenseTypeName === selectedType
      );
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.expenseForDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.expenseTypeName.toLowerCase().includes(query) ||
          expense.quantity.toString().includes(query) ||
          expense.totalCost.toString().includes(query)
      );
    }

    setFilteredExpenses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedType, expenses, searchQuery, dateRange]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
      if (direction === "asc") {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });

    setFilteredExpenses(sortedExpenses);
  };

  const expenseTypes = [
    "all",
    ...new Set(expenses.map((e) => e.expenseTypeName)),
  ];

  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedType("all");
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-gray-400">
            Loading expenses...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              My Expenses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredExpenses.length)} of{" "}
              {filteredExpenses.length} entries
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Date Range Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-4">
            <Input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-[150px]"
            />
            <Input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-[150px]"
            />
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">
                Date
              </TableHead>
              <TableHead className="py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">
                Type
              </TableHead>
              <TableHead className="py-4 px-6">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("quantity")}
                  className="text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
                >
                  Quantity
                  {sortConfig.key === "quantity" && (
                    <KeenIcon
                      icon={
                        sortConfig.direction === "asc"
                          ? "arrow-up"
                          : "arrow-down"
                      }
                      className="h-4 w-4"
                    />
                  )}
                </Button>
              </TableHead>
              <TableHead className="py-4 px-6">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalCost")}
                  className="text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
                >
                  Total Cost
                  {sortConfig.key === "totalCost" && (
                    <KeenIcon
                      icon={
                        sortConfig.direction === "asc"
                          ? "arrow-up"
                          : "arrow-down"
                      }
                      className="h-4 w-4"
                    />
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExpenses.map((expense) => (
              <TableRow
                key={expense.expenseId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <TableCell className="py-4 px-6 text-gray-600 dark:text-gray-300">
                  {new Date(expense.expenseForDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </TableCell>
                <TableCell className="py-4 px-6 text-gray-600 dark:text-gray-300">
                  {expense.expenseTypeName}
                </TableCell>
                <TableCell className="py-4 px-6 text-gray-600 dark:text-gray-300">
                  {expense.quantity}
                </TableCell>
                <TableCell className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                  ${expense.totalCost.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="px-4"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export { ExpenseTable };
