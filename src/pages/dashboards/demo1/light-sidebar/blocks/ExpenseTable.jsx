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
import { KeenIcon } from "@/components/keenicons";
import axios from "axios";
import { useAuthContext } from "@/auth";

const ITEMS_PER_PAGE = 10;

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    if (selectedType === "all") {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(
        expenses.filter((expense) => expense.expenseTypeName === selectedType)
      );
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedType, expenses]);

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
      <div className="flex justify-between items-center mb-6">
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
                  {new Date(expense.createdDate).toLocaleDateString(undefined, {
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
