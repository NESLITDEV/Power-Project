import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
import { useAuthContext } from "@/auth";
import { useLayout } from "@/providers";
import { Alert } from "@/components";
import { FormattedMessage, useIntl } from "react-intl";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  remember: Yup.boolean(),
});

const initialValues = {
  email: "",
  password: "",
  remember: false,
};

const Login = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!login) {
          throw new Error("JWTProvider is required for this form.");
        }
        await login(values.email, values.password);
        if (values.remember) {
          localStorage.setItem("email", values.email);
        } else {
          localStorage.removeItem("email");
        }
        navigate(from, {
          replace: true,
        });
      } catch {
        setStatus("The login details are incorrect");
        setSubmitting(false);
      }
      setLoading(false);
    },
  });

  const togglePassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[390px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            <FormattedMessage id="AUTH.LOGIN.TITLE" />
          </h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">
              <FormattedMessage id="AUTH.LOGIN.NO_ACCOUNT" />
            </span>
            <Link to="/auth/signup" className="text-2sm link">
              <FormattedMessage id="AUTH.LOGIN.SIGN_UP" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <a href="#" className="btn btn-light btn-sm justify-center">
            <img
              src={toAbsoluteUrl("/media/brand-logos/google.svg")}
              className="size-3.5 shrink-0"
            />
            Use Google
          </a>

          <a href="#" className="btn btn-light btn-sm justify-center">
            <img
              src={toAbsoluteUrl("/media/brand-logos/apple-black.svg")}
              className="size-3.5 shrink-0 dark:hidden"
            />
            <img
              src={toAbsoluteUrl("/media/brand-logos/apple-white.svg")}
              className="size-3.5 shrink-0 light:hidden"
            />
            Use Apple
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">
            Or
          </span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="AUTH.LOGIN.EMAIL" />
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
            <FormattedMessage id="AUTH.LOGIN.PASSWORD" />
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

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps("remember")}
          />
          <span className="checkbox-label">
            <FormattedMessage id="AUTH.LOGIN.REMEMBER_ME" />
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? (
            "Please wait..."
          ) : (
            <FormattedMessage id="AUTH.LOGIN.SUBMIT" />
          )}
        </button>
      </form>
    </div>
  );
};

export { Login };
