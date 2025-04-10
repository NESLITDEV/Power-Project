import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/auth";
import { Alert } from "@/components";

const CheckEmail = () => {
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { confirmEmailWithUrl } = useAuthContext();

  useEffect(() => {
    const data = sessionStorage.getItem("registrationData");
    if (data) {
      setRegistrationData(JSON.parse(data));
    }
  }, []);

  const handleConfirmEmail = async () => {
    if (!registrationData?.url) {
      setConfirmationResult({
        isSuccess: false,
        responseMessage:
          "Confirmation URL not found. Please try signing up again.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await confirmEmailWithUrl(registrationData.url);
      setConfirmationResult(result);
      if (result.isSuccess) {
        // Clear registration data after successful confirmation
        sessionStorage.removeItem("registrationData");
      }
    } catch (error) {
      setConfirmationResult({
        isSuccess: false,
        responseMessage:
          error.responseMessage ||
          "Email confirmation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-[440px] w-full">
      <div className="card-body p-10">
        <div className="flex justify-center py-10">
          {confirmationResult?.isSuccess ? (
            <img
              src={toAbsoluteUrl("/media/illustrations/32.svg")}
              className="dark:hidden max-h-[130px]"
              alt=""
            />
          ) : (
            <img
              src={toAbsoluteUrl("/media/illustrations/30.svg")}
              className="dark:hidden max-h-[130px]"
              alt=""
            />
          )}
          {confirmationResult?.isSuccess ? (
            <img
              src={toAbsoluteUrl("/media/illustrations/32-dark.svg")}
              className="light:hidden max-h-[130px]"
              alt=""
            />
          ) : (
            <img
              src={toAbsoluteUrl("/media/illustrations/30-dark.svg")}
              className="light:hidden max-h-[130px]"
              alt=""
            />
          )}
        </div>

        <h3 className="text-lg font-medium text-gray-900 text-center mb-3">
          {confirmationResult?.isSuccess
            ? "Email Verified Successfully!"
            : "Verify Your Email"}
        </h3>

        {confirmationResult && (
          <Alert
            variant={confirmationResult.isSuccess ? "success" : "danger"}
            className="mb-5"
          >
            {confirmationResult.responseMessage}
          </Alert>
        )}

        {!confirmationResult?.isSuccess && (
          <div className="text-2sm text-center text-gray-700 mb-7.5">
            {registrationData?.message || "Please verify your email address"}
            &nbsp;
            <span className="text-2sm text-gray-900 font-medium">
              {registrationData?.email}
            </span>
          </div>
        )}

        <div className="flex justify-center mb-5">
          {confirmationResult?.isSuccess ? (
            <Link
              to="/auth/login"
              className="btn btn-primary flex justify-center"
            >
              Proceed to Login
            </Link>
          ) : (
            <button
              onClick={handleConfirmEmail}
              disabled={loading}
              className="btn btn-primary flex justify-center"
            >
              {loading ? "Confirming..." : "Confirm Email"}
            </button>
          )}
        </div>

        {!confirmationResult?.isSuccess && (
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-700">
              Didn't receive confirmation email?
            </span>
            <Link to="/auth/signup" className="text-xs font-medium link">
              Sign up again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export { CheckEmail };
