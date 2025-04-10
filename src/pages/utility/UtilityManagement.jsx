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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UtilityUpload from "@/components/utility/UtilityUpload";
import ElectricityUsage from "./electricity";
import GasUsage from "./gas";
import WaterUsage from "./water";
import FuelBills from "./fuel";
import GenericExpense from "./generic";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { KeenIcon } from "@/components/keenicons";
import { toast } from "sonner";
import { FormattedMessage } from "react-intl";

const UtilityManagement = () => {
  const [selectedUtility, setSelectedUtility] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrFiles, setOcrFiles] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAddExpenseTypeOpen, setIsAddExpenseTypeOpen] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState("");
  const [ocrData, setOcrData] = useState(null);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/Auth/Get-Role-Expense-Types`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        // Find the user's role and its expense types
        const userRoleData = response.data.find((role) =>
          auth.roles.includes(role.roleName)
        );
        if (userRoleData) {
          setUserRole(userRoleData.roleName);
          setExpenseTypes(userRoleData.expenseTypes);
        }
      } catch (error) {
        console.error("Error fetching expense types:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchExpenseTypes();
    }
  }, [auth?.token, auth?.roles]);

  // Handle utility change
  const handleUtilityChange = (value) => {
    if (value === "add_new" && userRole === "Platinum") {
      setIsAddExpenseTypeOpen(true);
      return;
    }

    const selectedType = expenseTypes.find(
      (type) => type.expenseTypeName === value
    );
    setSelectedExpenseType(selectedType);
    setSelectedUtility(selectedType?.expenseTypeName || "");
    setSelectedFile(null);
    setOcrFiles([]);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleAddExpenseType = async () => {
    if (!newExpenseType) {
      toast.error(
        <FormattedMessage id="UTILITY.MANAGEMENT.ERROR.ENTER_EXPENSE_TYPE" />
      );
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/ExpenseTypes/Add-Expense-Type`,
        {
          expenseName: newExpenseType,
          description: "Premium User Expense",
          expenseCategoryId: "da7693ec-a4ee-40ad-bdcd-ab6fc2267f60",
          unitOfMeasurement: "unit",
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(
          <FormattedMessage id="UTILITY.MANAGEMENT.SUCCESS.EXPENSE_TYPE_ADDED" />
        );
        setIsAddExpenseTypeOpen(false);
        setNewExpenseType("");
        // Refresh expense types
        const typesResponse = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/Auth/Get-Role-Expense-Types`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );
        const userRoleData = typesResponse.data.find((role) =>
          auth.roles.includes(role.roleName)
        );
        if (userRoleData) {
          setExpenseTypes(userRoleData.expenseTypes);
        }
      } else {
        toast.error(
          <FormattedMessage id="UTILITY.MANAGEMENT.ERROR.ADD_EXPENSE_TYPE_FAILED" />
        );
      }
    } catch (error) {
      console.error("Error adding expense type:", error);
      toast.error(
        error.response?.data?.message || (
          <FormattedMessage id="UTILITY.MANAGEMENT.ERROR.ADD_EXPENSE_TYPE_FAILED" />
        )
      );
    }
  };

  const handleOcrData = (data) => {
    setOcrData(data);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <FormattedMessage id="UTILITY.MANAGEMENT.LOADING" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Utility Selection Dropdown */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              <FormattedMessage id="UTILITY.MANAGEMENT.ADD_EXPENSE" />
            </h2>
            {userRole && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <FormattedMessage id="UTILITY.MANAGEMENT.ACCOUNT_TYPE" />:{" "}
                {userRole}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedUtility} onValueChange={handleUtilityChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={
                    <FormattedMessage id="UTILITY.MANAGEMENT.SELECT_UTILITY" />
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem
                    key={type.expenseTypeId}
                    value={type.expenseTypeName}
                  >
                    {type.expenseTypeName}
                  </SelectItem>
                ))}
                {userRole === "Platinum" && (
                  <SelectItem
                    value="add_new"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <div className="flex items-center gap-2">
                      <KeenIcon icon="plus" className="h-4 w-4" />
                      <FormattedMessage id="UTILITY.MANAGEMENT.ADD_EXPENSE_TYPE" />
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* OCR Upload Section */}
      <UtilityUpload
        title={
          selectedUtility || (
            <FormattedMessage id="UTILITY.MANAGEMENT.UTILITY" />
          )
        }
        onFileSelect={handleFileSelect}
        ocrFiles={ocrFiles}
        setOcrFiles={setOcrFiles}
        disabled={!selectedUtility}
        onOcrData={handleOcrData}
      />

      {/* Selected Utility Component */}
      <ElectricityUsage
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        expenseTypeId={selectedExpenseType?.expenseTypeId}
        expenseCategoryId={selectedExpenseType?.expenseCategoryId}
        unitOfMeasurement={selectedExpenseType?.unitOfMeasurement}
        disabled={!selectedUtility}
        expenseTypeName={selectedExpenseType?.expenseTypeName}
        ocrData={ocrData}
        setOcrFiles={setOcrFiles}
      />

      {/* Add Expense Type Sheet */}
      <Sheet open={isAddExpenseTypeOpen} onOpenChange={setIsAddExpenseTypeOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <FormattedMessage id="UTILITY.MANAGEMENT.ADD_NEW_EXPENSE_TYPE" />
            </SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="UTILITY.MANAGEMENT.ENTER_EXPENSE_TYPE" />
                </label>
                <Input
                  value={newExpenseType}
                  onChange={(e) => setNewExpenseType(e.target.value)}
                  placeholder={
                    <FormattedMessage id="UTILITY.MANAGEMENT.EXPENSE_TYPE_PLACEHOLDER" />
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleAddExpenseType}>
              <FormattedMessage id="UTILITY.MANAGEMENT.SAVE" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UtilityManagement;
