import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedMessage } from "react-intl";
import { KeenIcon } from "@/components/keenicons";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthContext } from "@/auth";
import axios from "axios";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

const AddLocation = () => {
  const { auth } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenseTypes, setIsLoadingExpenseTypes] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [isLoadingExpenseData, setIsLoadingExpenseData] = useState(true);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const [filteredExpenseData, setFilteredExpenseData] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] = useState("");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressComplete, setNewAddressComplete] = useState("");
  const [newAddressDescription, setNewAddressDescription] = useState("");
  const [isFormEnabled, setIsFormEnabled] = useState(false);

  const [formState, setFormState] = useState({
    ratePerUnit: "",
    unitsConsumed: "",
    date: "",
  });

  const fetchAddressesForDropdown = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/Address/GetAddressesByCurrunt`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setAddresses(response.data || []);

      setLocations(
        (response.data || []).map((address) => ({
          id: address.addressId,
          name: address.addressName,
          type: getAddressTypeLabel(address.addressType),
          address: address.completeAddress,
          city: "N/A",
          country: "N/A",
          linkedAddressId: address.addressId,
          linkedExpenseTypeId: null,
          createdAt: new Date(address.createdDate).toLocaleDateString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses. Please try again.");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenseData = async () => {
    setIsLoadingExpenseData(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/AddressExpense/GetExpenseWithAddress`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setExpenseData(response.data || []);
    } catch (error) {
      console.error("Error fetching expense data:", error);
      toast.error("Failed to load expense overview. Please try again.");
      setExpenseData([]);
    } finally {
      setIsLoadingExpenseData(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchAddressesForDropdown();
      fetchExpenseData();
    } else {
      setIsLoading(false);
      setIsLoadingExpenseData(false);
      setAddresses([]);
      setExpenseData([]);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (!expenseSearchQuery) {
      setFilteredExpenseData(expenseData);
      return;
    }
    const lowercaseQuery = expenseSearchQuery.toLowerCase();
    const filtered = expenseData.filter(
      (item) =>
        (item.addressName &&
          item.addressName.toLowerCase().includes(lowercaseQuery)) ||
        (item.expenseTypeName &&
          item.expenseTypeName.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredExpenseData(filtered);
  }, [expenseData, expenseSearchQuery]);

  useEffect(() => {
    setIsFormEnabled(!!selectedAddressId && !!selectedExpenseTypeId);

    if (!selectedAddressId || !selectedExpenseTypeId) {
      setFormState({
        ratePerUnit: "",
        unitsConsumed: "",
        date: "",
      });
    }
  }, [selectedAddressId, selectedExpenseTypeId]);

  const handleAddressChange = (value) => {
    if (value === "add_new") {
      setIsAddAddressOpen(true);
      setSelectedAddressId("");
      return;
    }
    setSelectedAddressId(value);
  };

  const handleExpenseTypeChange = (value) => {
    setSelectedExpenseTypeId(value);
  };

  const getExpenseTypeName = (expenseTypeId) => {
    const expenseType = expenseTypes.find(
      (e) => e.expenseTypeId === expenseTypeId
    );
    return expenseType ? expenseType.expenseName : "Unknown";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormEnabled) {
      toast.error("Please select an address and an expense type first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Construct the request body for the new endpoint
      const requestBody = {
        expenseTypeId: selectedExpenseTypeId,
        addressId: selectedAddressId,
        status: 1, // Assuming 1 means Active, adjust if needed
        quantity: parseFloat(formState.unitsConsumed) || 0, // Parse and default to 0 if NaN
        ratePerUnit: parseFloat(formState.ratePerUnit) || 0, // Parse and default to 0 if NaN
        // Convert the date string "YYYY-MM-DD" to an ISO string for the backend
        expenseForDate: new Date(formState.date).toISOString(),
      };

      // Make the actual API call
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/AddressExpense/AddExpenseWithAddress`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      toast.success(`Expense recorded for ${formState.date} successfully.`);

      setFormState({
        ratePerUnit: "",
        unitsConsumed: "",
        date: "",
      });
      await fetchExpenseData();
    } catch (error) {
      toast.error("Failed to process location. Please try again.");
      console.error("Error processing location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = async () => {

    if (!newAddressName || !newAddressComplete) {
      toast.error("Please enter Address Name and Complete Address.");
      return;
    }

    setIsAddingAddress(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/Address/AddAddress`,
        {
          addressName: newAddressName,
          completeAddress: newAddressComplete,
          description: newAddressDescription,
          addressType: 0, // Defaulting as per example
          status: 1, // Assuming 1 means Active
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      toast.success(`Address '${newAddressName}' added successfully.`);
      setIsAddAddressOpen(false);
      setNewAddressName("");
      setNewAddressComplete("");
      setNewAddressDescription("");
      await fetchAddressesForDropdown();

      if (response.data && response.data.addressId) {
        setSelectedAddressId(response.data.addressId);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address. Please check console and try again.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (parseInt(type)) {
      case 0:
        return "Office";
      case 1:
        return "Residential";
      case 2:
        return "Warehouse";
      case 3:
        return "Manufacturing";
      case 4:
        return "Retail";
      default:
        return "Other";
    }
  };

  if (isLoading || isLoadingExpenseTypes || isLoadingExpenseData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center">
              <KeenIcon
                icon="spinner"
                className="animate-spin h-8 w-8 text-primary mb-4"
              />
              <p className="text-gray-500 dark:text-gray-400">
                {isLoading
                  ? "Loading addresses..."
                  : isLoadingExpenseTypes
                    ? "Loading expense types..."
                    : "Loading expense overview..."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              <FormattedMessage
                id="location.management.title"
                defaultMessage="Property Management"
              />
            </h2>
            {auth?.roles && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="location.management.account"
                  defaultMessage="Account Type"
                />
                : {auth.roles[0]}
              </p>
            )}
          </div>
        </div>
      </Card>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-full md:w-1/3 space-y-2">
            <label
              htmlFor="address"
              className="form-label text-gray-800 dark:text-gray-200 font-medium"
            >
              <FormattedMessage
                id="location.address.select"
                defaultMessage="Select Address"
              />
            </label>
            <Select
              value={selectedAddressId}
              onValueChange={handleAddressChange}
            >
              <SelectTrigger
                id="address"
                className="bg-white dark:bg-gray-800 w-full"
              >
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <SelectItem
                      key={address.addressId}
                      value={address.addressId}
                    >
                      {address.addressName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No addresses found.
                  </div>
                )}
                <SelectItem
                  value="add_new"
                  className="text-blue-600 dark:text-blue-400 mt-2 border-t pt-2 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <KeenIcon icon="plus" className="h-4 w-4" />
                    <FormattedMessage
                      id="location.address.add"
                      defaultMessage="Add New Address"
                    />
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3 space-y-2">
            <label
              htmlFor="expenseType"
              className="form-label text-gray-800 dark:text-gray-200 font-medium"
            >
              <FormattedMessage
                id="location.expenseType.select"
                defaultMessage="Select Expense Type"
              />
            </label>
            <Select
              value={selectedExpenseTypeId}
              onValueChange={handleExpenseTypeChange}
              disabled={!selectedAddressId}
            >
              <SelectTrigger
                id="expenseType"
                className="bg-white dark:bg-gray-800 w-full"
              >
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.length > 0 ? (
                  expenseTypes.map((type) => (
                    <SelectItem
                      key={type.expenseTypeId}
                      value={type.expenseTypeId}
                    >
                      {type.expenseName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No expense types found.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3 flex items-end pb-0.5">
            <div
              className={`px-4 py-2 rounded-md text-sm ${
                isFormEnabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {isFormEnabled ? (
                <FormattedMessage
                  id="location.form.enabled"
                  defaultMessage="Ready to add location details"
                />
              ) : (
                <FormattedMessage
                  id="location.form.disabled.both"
                  defaultMessage="Select address & expense type"
                />
              )}
            </div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <Card
          className={`shadow-md border-gray-200 dark:border-gray-700 ${!isFormEnabled ? "opacity-60 pointer-events-none" : ""}`}
        >
          <CardHeader className="space-y-1 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <KeenIcon icon="clipboard" className="w-6 h-6 text-primary" />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FormattedMessage
                  id="consumption.add.title"
                  defaultMessage="Record Consumption Data"
                />
              </CardTitle>
            </div>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              <FormattedMessage
                id="consumption.add.description"
                defaultMessage="Enter details for the selected address and expense type"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="ratePerUnit"
                    className="form-label text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <FormattedMessage
                      id="consumption.add.rateLabel"
                      defaultMessage="Rate Per Unit"
                    />
                  </label>
                  <Input
                    id="ratePerUnit"
                    type="number"
                    step="any"
                    value={formState.ratePerUnit}
                    onChange={handleInputChange}
                    placeholder="Enter rate"
                    className="bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="unitsConsumed"
                    className="form-label text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <FormattedMessage
                      id="consumption.add.unitsLabel"
                      defaultMessage="Units Consumed"
                    />
                  </label>
                  <Input
                    id="unitsConsumed"
                    type="number"
                    step="any"
                    value={formState.unitsConsumed}
                    onChange={handleInputChange}
                    placeholder="Enter units"
                    className="bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="date"
                    className="form-label text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <FormattedMessage
                      id="consumption.add.dateLabel"
                      defaultMessage="Date"
                    />
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formState.date}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormEnabled}
                  className="bg-primary hover:bg-primary-dark text-white px-6"
                >
                  {isSubmitting ? (
                    <>
                      <KeenIcon
                        icon="spinner"
                        className="animate-spin mr-2 h-4 w-4"
                      />
                      <FormattedMessage
                        id="consumption.add.submittingButton"
                        defaultMessage="Saving..."
                      />
                    </>
                  ) : (
                    <FormattedMessage
                      id="consumption.add.submitButton"
                      defaultMessage="Save Data"
                    />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Sheet open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader className="pb-6 border-b dark:border-gray-700">
              <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FormattedMessage
                  id="location.address.addNew"
                  defaultMessage="Add New Address"
                />
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label
                  htmlFor="newAddressName"
                  className="form-label text-gray-800 dark:text-gray-200 font-medium"
                >
                  <FormattedMessage
                    id="location.address.nameLabel"
                    defaultMessage="Address Name"
                  />
                  <span className="text-red-500"> *</span>
                </label>
                <Input
                  id="newAddressName"
                  value={newAddressName}
                  onChange={(e) => setNewAddressName(e.target.value)}
                  placeholder="Enter address name"
                  className="bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newAddressComplete"
                  className="form-label text-gray-800 dark:text-gray-200 font-medium"
                >
                  <FormattedMessage
                    id="location.address.completeLabel"
                    defaultMessage="Complete Address"
                  />
                  <span className="text-red-500"> *</span>
                </label>
                <Input
                  id="newAddressComplete"
                  value={newAddressComplete}
                  onChange={(e) => setNewAddressComplete(e.target.value)}
                  placeholder="Enter complete address"
                  className="bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newAddressDescription"
                  className="form-label text-gray-800 dark:text-gray-200 font-medium"
                >
                  <FormattedMessage
                    id="location.address.descriptionLabel"
                    defaultMessage="Description"
                  />
                </label>
                <textarea
                  id="newAddressDescription"
                  value={newAddressDescription}
                  onChange={(e) => setNewAddressDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter address description (optional)"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <SheetFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddAddressOpen(false)}
                  disabled={isAddingAddress}
                >
                  <FormattedMessage
                    id="location.address.cancel"
                    defaultMessage="Cancel"
                  />
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={isAddingAddress}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  {isAddingAddress ? (
                    <>
                      <KeenIcon
                        icon="spinner"
                        className="animate-spin mr-2 h-4 w-4"
                      />
                      <FormattedMessage
                        id="location.address.saving"
                        defaultMessage="Saving..."
                      />
                    </>
                  ) : (
                    <FormattedMessage
                      id="location.address.save"
                      defaultMessage="Save Address"
                    />
                  )}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FormattedMessage
                  id="location.list.title"
                  defaultMessage="Expense Overview"
                />
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Search expenses..."
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full border-separate border-spacing-0">
                <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700">
                  <div className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Name
                  </div>
                  <div className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expense Type
                  </div>
                  <div className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Total Cost
                  </div>
                  <div className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300 text-end">
                    Expense Date
                  </div>
                </div>

                {isLoadingExpenseData && (
                  <div className="col-span-4 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <KeenIcon
                        icon="spinner"
                        className="animate-spin h-8 w-8 text-primary mb-4"
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        Loading expense data...
                      </p>
                    </div>
                  </div>
                )}

                {!isLoadingExpenseData && filteredExpenseData.length === 0 && (
                  <div className="col-span-4 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <KeenIcon
                        icon="document"
                        className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-4"
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        {expenseSearchQuery
                          ? "No expenses match your search."
                          : "No expense data recorded yet."}
                      </p>
                    </div>
                  </div>
                )}

                {!isLoadingExpenseData &&
                  filteredExpenseData.map((item, index) => (
                    <div
                      key={item.userAddressExpenseId}
                      className={`grid grid-cols-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
                    >
                      <div className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 font-medium border-b border-gray-100 dark:border-gray-800 flex items-center">
                        {item.addressName || "N/A"}
                      </div>
                      <div className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {item.expenseTypeName || "N/A"}
                        </span>
                      </div>
                      <div className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 font-medium text-end border-b border-gray-100 dark:border-gray-800 flex items-center justify-center">
                        {item.totalCost != null ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ${item.totalCost.toFixed(2)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div className="py-4 px-6 text-sm text-end text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end">
                        {item.expenseForDate ? (
                          <span className="whitespace-nowrap">
                            {new Date(item.expenseForDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddLocation;
