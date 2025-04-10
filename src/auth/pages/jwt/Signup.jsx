import clsx from "clsx";
import { useFormik } from "formik";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAuthContext } from "../../useAuthContext";
import { toAbsoluteUrl } from "@/utils";
import { Alert, KeenIcon } from "@/components";
import { useLayout } from "@/providers";
import { AxiosError } from "axios";
import { FormattedMessage, useIntl } from "react-intl";

const initialValues = {
  email: "",
  password: "",
  changepassword: "",
  acceptTerms: false,
  userName: "",
};

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  userName: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Username is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  changepassword: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password")], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.bool().required("You must accept the terms and conditions"),
});

const Signup = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error("JWTProvider is required for this form.");
        }
        const response = await register(
          values.email,
          values.password,
          values.userName
        );
        sessionStorage.setItem(
          "registrationData",
          JSON.stringify({
            ...response,
            email: values.email,
          })
        );
        navigate("/auth/check-email");
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          setStatus(error.response.data.message);
        } else if (error.message === "JWTProvider is required for this form.") {
          setStatus(
            "Authentication service is not available. Please try again later."
          );
        } else {
          setStatus("Registration failed. Please try again.");
        }
        setSubmitting(false);
      }
      setLoading(false);
    },
  });

  const togglePassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            <FormattedMessage id="AUTH.REGISTER.TITLE" />
          </h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">
              <FormattedMessage id="AUTH.REGISTER.HAS_ACCOUNT" />
            </span>
            <Link to="/auth/login" className="text-2sm link">
              <FormattedMessage id="AUTH.REGISTER.SIGN_IN" />
            </Link>
          </div>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="AUTH.REGISTER.USERNAME" />
          </label>
          <label className="input">
            <input
              placeholder="Enter your username"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps("userName")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.userName && formik.errors.userName,
                },
                {
                  "is-valid":
                    formik.touched.userName && !formik.errors.userName,
                }
              )}
            />
          </label>
          {formik.touched.userName && formik.errors.userName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.userName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="AUTH.REGISTER.EMAIL" />
          </label>
          <label className="input">
            <input
              placeholder="Enter your email"
              type="email"
              autoComplete="off"
              {...formik.getFieldProps("email")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid": formik.touched.email && formik.errors.email,
                },
                {
                  "is-valid": formik.touched.email && !formik.errors.email,
                }
              )}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="AUTH.REGISTER.PASSWORD" />
          </label>
          <label className="input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="off"
              {...formik.getFieldProps("password")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.password && formik.errors.password,
                },
                {
                  "is-valid":
                    formik.touched.password && !formik.errors.password,
                }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showPassword,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showPassword,
                })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="AUTH.REGISTER.CONFIRM_PASSWORD" />
          </label>
          <label className="input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="off"
              {...formik.getFieldProps("changepassword")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid":
                    formik.touched.changepassword &&
                    formik.errors.changepassword,
                },
                {
                  "is-valid":
                    formik.touched.changepassword &&
                    !formik.errors.changepassword,
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showConfirmPassword,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showConfirmPassword,
                })}
              />
            </button>
          </label>
          {formik.touched.changepassword && formik.errors.changepassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.changepassword}
            </span>
          )}
        </div>

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps("acceptTerms")}
          />
          <span className="checkbox-label">
            <FormattedMessage id="AUTH.REGISTER.TERMS" />
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <span role="alert" className="text-danger text-xs mt-1">
            {formik.errors.acceptTerms}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? (
            "Please wait..."
          ) : (
            <FormattedMessage id="AUTH.REGISTER.SUBMIT" />
          )}
        </button>
      </form>
    </div>
  );
};

export { Signup };
