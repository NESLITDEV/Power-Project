import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { KeenIcon } from "@/components/keenicons";

const UtilityUpload = ({
  title = "Utility",
  onFileSelect,
  ocrFiles,
  setOcrFiles,
  disabled,
  onOcrData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const { auth } = useAuthContext();

  // Watch for selectedFile changes through ocrFiles
  useEffect(() => {
    if (ocrFiles.length === 0) {
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }, [ocrFiles]);

  // Cleanup URLs when component unmounts or when ocrFiles changes
  useEffect(() => {
    return () => {
      ocrFiles.forEach((file) => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [ocrFiles]);

  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "application/pdf",
      ].includes(file.type);
      if (!isValidType) {
        toast.error(
          "Invalid file type. Please upload JPEG, PNG, or PDF files."
        );
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const fileWithUrl = validFiles[0];
      fileWithUrl.url = URL.createObjectURL(fileWithUrl);
      onFileSelect(fileWithUrl);
      setOcrFiles([fileWithUrl]);
    }
  };

  const removeFile = (index) => {
    if (disabled) return;
    const fileToRemove = ocrFiles[index];
    if (fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setOcrFiles([]);
    onFileSelect(null);
    // Reset the file input value
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleOcr = async (file) => {
    if (!file) return;
    setIsOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/Bill/analyze-Bill-Electricity`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Format the OCR response data
        const ocrData = {
          unitsConsumed: response.data.unitsConsumed,
          ratePerUnit: response.data.pricePerUnit,
          totalBill: response.data.totalBill,
          date: new Date().toISOString().split("T")[0], // Set today's date as default
          notes: `OCR extracted bill amount: ${response.data.totalBill}`,
        };

        toast.success("OCR completed successfully");
        onOcrData?.(ocrData);
      } else {
        toast.error("Failed to process OCR");
      }
    } catch (error) {
      console.error("Error processing OCR:", error);
      toast.error(error.response?.data?.message || "Failed to process OCR");
    } finally {
      setIsOcrLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title} Bill Upload</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <p className="text-gray-600">
            {disabled
              ? "Please select a utility type first"
              : `Drag and drop your ${title.toLowerCase()} bill here, or click to browse`}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: JPEG, PNG, PDF
          </p>
          <Input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={disabled}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload").click()}
            disabled={disabled}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {ocrFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
          <div className="space-y-2">
            {ocrFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm">{file.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOcr(file)}
                    disabled={disabled || isOcrLoading}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center min-w-[100px] px-2"
                  >
                    {isOcrLoading ? (
                      <div className="flex items-center">
                        <KeenIcon
                          icon="spinner"
                          className="animate-spin mr-2 h-4 w-4"
                        />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>Extract Data</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default UtilityUpload;
