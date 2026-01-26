import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type SignInForm = {
  email: string;
  password: string;
  remember: boolean;
};

type SignUpForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type SignInErrors = {
  email?: string;
  password?: string;
  form?: string;
};

type SignUpErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = React.useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [signInLoading, setSignInLoading] = React.useState(false);
  const [signUpLoading, setSignUpLoading] = React.useState(false);
  const [signInErrors, setSignInErrors] = React.useState<SignInErrors>({});
  const [signUpErrors, setSignUpErrors] = React.useState<SignUpErrors>({});
  const [signInAnimate, setSignInAnimate] = React.useState(false);
  const [signUpAnimate, setSignUpAnimate] = React.useState(false);

  const [signIn, setSignIn] = React.useState<SignInForm>({
    email: "",
    password: "",
    remember: false,
  });

  const [signUp, setSignUp] = React.useState<SignUpForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    const stateTab = (location.state as { tab?: string } | null)?.tab;
    const searchTab = new URLSearchParams(location.search).get("tab");
    const nextTab = stateTab ?? searchTab;

    if (nextTab === "signin" || nextTab === "signup") {
      setTab(nextTab);
    }
  }, [location.search, location.state]);

  const triggerSignInAnimation = () => {
    setSignInAnimate(true);
    window.setTimeout(() => setSignInAnimate(false), 400);
  };

  const triggerSignUpAnimation = () => {
    setSignUpAnimate(true);
    window.setTimeout(() => setSignUpAnimate(false), 400);
  };

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; errors?: string[] }
        | undefined;
      if (data?.errors?.length) return data.errors.join(", ");
      if (data?.message) return data.message;
    }
    return "An error occurred. Please try again.";
  };

  const validateSignIn = (data: SignInForm) => {
    const next: SignInErrors = {};
    const email = data.email.trim();
    const password = data.password;

    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Invalid email format.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters.";

    return next;
  };

  const validateSignUp = (data: SignUpForm) => {
    const next: SignUpErrors = {};
    const name = data.name.trim();
    const email = data.email.trim();
    const phoneDigits = data.phone.replace(/\D/g, "");
    const password = data.password;
    const confirmPassword = data.confirmPassword;

    if (!name) next.name = "Name is required.";
    else if (name.length < 2) next.name = "Name must be at least 2 characters.";

    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Invalid email format.";

    if (!data.phone) next.phone = "Phone number is required.";
    else if (phoneDigits.length < 10 || phoneDigits.length > 15)
      next.phone = "Phone number must be 10-15 digits.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 8 6haracters.";

    if (!confirmPassword)
      next.confirmPassword = "Password confirmation is required.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords are not the same.";

    return next;
  };

  const onSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({});
    const errors = validateSignIn(signIn);
    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors);
      triggerSignInAnimation();
      return;
    }

    try {
      setSignInLoading(true);
      const response = await api.post("/api/auth/login", {
        email: signIn.email.trim().toLowerCase(),
        password: signIn.password,
      });

      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (token) {
        if (signIn.remember) {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(user ?? {}));
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_user");
        } else {
          sessionStorage.setItem("auth_token", token);
          sessionStorage.setItem("auth_user", JSON.stringify(user ?? {}));
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
        
        // Reset form
        setSignIn({
          email: "",
          password: "",
          remember: false,
        });
        
        navigate("/");
      } else {
        setSignInErrors({ form: "Login failed. Please try again." });
        triggerSignInAnimation();
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setSignInErrors({ form: errorMsg });
      triggerSignInAnimation();
      console.error("Login error:", error);
    } finally {
      setSignInLoading(false);
    }
  };

  const onSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({});
    const errors = validateSignUp(signUp);
    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      triggerSignUpAnimation();
      return;
    }

    try {
      setSignUpLoading(true);
      
      // Format phone number - remove all non-digits
      let formattedPhone = signUp.phone.trim().replace(/\D/g, "");
      
      // If phone starts with 0, replace with 62 (Indonesia country code)
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "62" + formattedPhone.substring(1);
      }
      // If phone doesn't start with 62, add it
      else if (!formattedPhone.startsWith("62")) {
        formattedPhone = "62" + formattedPhone;
      }

      console.log("Sending registration data:", {
        name: signUp.name.trim(),
        email: signUp.email.trim().toLowerCase(),
        phone: formattedPhone,
      });

      const response = await api.post("/api/auth/register", {
        name: signUp.name.trim(),
        email: signUp.email.trim().toLowerCase(),
        phone: formattedPhone,
        password: signUp.password,
        password_confirmation: signUp.confirmPassword,
      });

      console.log("Registration response:", response.data);

      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (token) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user ?? {}));
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user");
        
        // Reset form after successful registration
        setSignUp({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        
        navigate("/");
      } else {
        setSignUpErrors({ form: "Registration failed. Please try again." });
        triggerSignUpAnimation();
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      const errorMsg = getErrorMessage(error);
      
      // Handle specific error cases
      if (errorMsg.toLowerCase().includes("email")) {
        setSignUpErrors({ 
          email: "This email is already registered.",
          form: errorMsg 
        });
      } else if (errorMsg.toLowerCase().includes("phone")) {
        setSignUpErrors({ 
          phone: "This phone number is already registered.",
          form: errorMsg 
        });
      } else if (errorMsg.toLowerCase().includes("password")) {
        setSignUpErrors({ 
          password: "Password validation failed.",
          form: errorMsg 
        });
      } else {
        setSignUpErrors({ form: errorMsg });
      }
      
      triggerSignUpAnimation();
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white">
      <div className="flex h-screen w-full">
        {/* LEFT (MENU) */}
        <div className="relative hidden flex-1 items-center justify-center md:flex">
          <img
            src="/images/common/burger.svg"
            alt="Burger"
            className="w-full object-contain"
            draggable={false}
          />
        </div>

        {/* RIGHT - FORM */}
        <div className="flex flex-1 items-center justify-center px-6 md:px-0">
          <div className="w-full max-w-md flex flex-col gap-4 md:gap-5 md:w-93.5">

            {/* LOGO ROW */}
            <div className="8 flex items-center gap-3 md:gap-3.75">
              <img
                src="/images/common/logo-foody.svg"
                alt="Foody"
                className="h-8 w-8 md:h-10.5 md:w-10.5"
                draggable={false}
              />
              <span className="text-[24.38px] md:text-[32px] md:leading-10.5 font-extrabold leading-8 text-neutral-950">
                Foody
              </span>
            </div>

            {/* TITLE + SUBTITLE */}
            <div className="flex flex-col gap-0 md:gap-1">
              <h1 className="text-[24px] md:text-[28px] font-extrabold leading-9 md:leading-9.5 text-neutral-950">
                {tab === "signin" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-[14px] md:text-[16px] leading-7 md:leading-7.5 -tracking-[0.03em] text-neutral-950">
                {tab === "signin" 
                  ? "Good to see you again! Let's eat"
                  : "Join us and start your culinary journey"
                }
              </p>
            </div>

            {/* TOGGLE TABS */}
            <div className="">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as "signin" | "signup");
                  setSignInErrors({});
                  setSignUpErrors({});
                }}
              >
                <TabsList className="h-14 w-full rounded-full bg-neutral-100 p-1 cursor-pointer">
                  <TabsTrigger
                    value="signin"
                    className="h-full w-1/2 rounded-full text-base font-semibold text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm cursor-pointer"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="h-full w-1/2 rounded-full text-base font-semibold text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm cursor-pointer"
                  >
                    Sign up
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {tab === "signin" ? (
                    <TabsContent value="signin" className="mt-3" forceMount>
                      <motion.div
                        key="signin"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form
                          onSubmit={onSubmitSignIn}
                          className="flex flex-col gap-4 md:gap-5"
                        >
                          <div>
                            <input
                              type="email"
                              placeholder="Email"
                              value={signIn.email}
                              onChange={(e) =>
                                setSignIn((p) => ({ ...p, email: e.target.value }))
                              }
                              className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                signInErrors.email
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-neutral-200 focus:border-neutral-300"
                              } ${signInAnimate && signInErrors.email ? "animate-shake" : ""}`}
                            />
                            {signInErrors.email ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signInAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signInErrors.email}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={signIn.password}
                                onChange={(e) =>
                                  setSignIn((p) => ({ ...p, password: e.target.value }))
                                }
                                className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 pr-14 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                  signInErrors.password
                                    ? "border-red-400 focus:border-red-400"
                                    : "border-neutral-200 focus:border-neutral-300"
                                } ${
                                  signInAnimate && signInErrors.password
                                    ? "animate-shake"
                                    : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 active:scale-95"
                                aria-label="Toggle password visibility"
                              >
                                <img
                                  src="/images/common/eye.svg"
                                  alt="Show/Hide"
                                  className="h-4 w-4"
                                  draggable={false}
                                />
                              </button>
                            </div>
                            {signInErrors.password ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signInAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signInErrors.password}
                              </p>
                            ) : null}
                          </div>

                          <label className="flex cursor-pointer items-center gap-3 select-none">
                            <Checkbox
                              checked={signIn.remember}
                              onCheckedChange={(checked) =>
                                setSignIn((p) => ({
                                  ...p,
                                  remember: Boolean(checked),
                                }))
                              }
                              className="h-6 w-6 rounded-md border-neutral-300 data-[state=checked]:bg-primary-100 data-[state=checked]:border-primary-100 cursor-pointer"
                            />
                            <span className="text-[14px] leading-7 md:text-[16px] md:leading-7.5 -tracking-[0.03em] font-medium text-neutral-900">
                              Remember Me
                            </span>
                          </label>

                          {signInErrors.form ? (
                            <p
                              className={`text-sm text-red-600 ${
                                signInAnimate ? "animate-shake" : ""
                              }`}
                            >
                              {signInErrors.form}
                            </p>
                          ) : null}

                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={signInLoading}
                            className="h-12 w-full rounded-full px-2 py-2 bg-primary-100 text-[16px] leading-7.5 -tracking-[0.02em] font-bold text-neutral-25 shadow-[0_10px_20px_rgba(184,13,13,0.18)] transition active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {signInLoading ? "Loading..." : "Login"}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>
                  ) : (
                    <TabsContent value="signup" className="mt-3" forceMount>
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form
                          onSubmit={onSubmitSignUp}
                          className="flex flex-col gap-4 md:gap-5"
                        >
                          <div>
                            <input
                              type="text"
                              placeholder="Name"
                              value={signUp.name}
                              onChange={(e) =>
                                setSignUp((p) => ({ ...p, name: e.target.value }))
                              }
                              className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                signUpErrors.name
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-neutral-200 focus:border-neutral-300"
                              } ${signUpAnimate && signUpErrors.name ? "animate-shake" : ""}`}
                            />
                            {signUpErrors.name ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signUpAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signUpErrors.name}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <input
                              type="email"
                              placeholder="Email"
                              value={signUp.email}
                              onChange={(e) =>
                                setSignUp((p) => ({ ...p, email: e.target.value }))
                              }
                              className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                signUpErrors.email
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-neutral-200 focus:border-neutral-300"
                              } ${signUpAnimate && signUpErrors.email ? "animate-shake" : ""}`}
                            />
                            {signUpErrors.email ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signUpAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signUpErrors.email}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <input
                              type="tel"
                              placeholder="Phone Number (e.g., 081234567890)"
                              value={signUp.phone}
                              onChange={(e) =>
                                setSignUp((p) => ({ ...p, phone: e.target.value }))
                              }
                              className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                signUpErrors.phone
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-neutral-200 focus:border-neutral-300"
                              } ${signUpAnimate && signUpErrors.phone ? "animate-shake" : ""}`}
                            />
                            {signUpErrors.phone ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signUpAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signUpErrors.phone}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={signUp.password}
                                onChange={(e) =>
                                  setSignUp((p) => ({ ...p, password: e.target.value }))
                                }
                                className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 pr-14 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                  signUpErrors.password
                                    ? "border-red-400 focus:border-red-400"
                                    : "border-neutral-200 focus:border-neutral-300"
                                } ${
                                  signUpAnimate && signUpErrors.password
                                    ? "animate-shake"
                                    : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 active:scale-95"
                                aria-label="Toggle password visibility"
                              >
                                <img
                                  src="/images/common/eye.svg"
                                  alt="Show/Hide"
                                  className="h-5 w-5 opacity-80"
                                  draggable={false}
                                />
                              </button>
                            </div>
                            {signUpErrors.password ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signUpAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signUpErrors.password}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <div className="relative">
                              <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={signUp.confirmPassword}
                                onChange={(e) =>
                                  setSignUp((p) => ({
                                    ...p,
                                    confirmPassword: e.target.value,
                                  }))
                                }
                                className={`h-12 md:h-14 w-full rounded-2xl border bg-white px-3 pr-14 text-base outline-none placeholder:text-neutral-500 placeholder:-tracking-[0.02em] ${
                                  signUpErrors.confirmPassword
                                    ? "border-red-400 focus:border-red-400"
                                    : "border-neutral-200 focus:border-neutral-300"
                                } ${
                                  signUpAnimate && signUpErrors.confirmPassword
                                    ? "animate-shake"
                                    : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirm((s) => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 active:scale-95"
                                aria-label="Toggle confirm password visibility"
                              >
                                <img
                                  src="/images/common/eye.svg"
                                  alt="Show/Hide"
                                  className="h-5 w-5 opacity-80"
                                  draggable={false}
                                />
                              </button>
                            </div>
                            {signUpErrors.confirmPassword ? (
                              <p
                                className={`mt-1 text-xs text-red-600 ${
                                  signUpAnimate ? "animate-shake" : ""
                                }`}
                              >
                                {signUpErrors.confirmPassword}
                              </p>
                            ) : null}
                          </div>

                          {signUpErrors.form ? (
                            <p
                              className={`text-sm text-red-600 ${
                                signUpAnimate ? "animate-shake" : ""
                              }`}
                            >
                              {signUpErrors.form}
                            </p>
                          ) : null}

                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={signUpLoading}
                            className="h-12 w-full rounded-full px-2 py-2 bg-primary-100 text-[16px] leading-7.5 -tracking-[0.02em] font-bold text-neutral-25 shadow-[0_10px_20px_rgba(184,13,13,0.18)] transition active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {signUpLoading ? "Loading..." : "Register"}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}