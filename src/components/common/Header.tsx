import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { clearCart } from "@/features/cart/cartSlice";
import { clearFilters } from "@/features/filters/categoryFilterSlice";
import { setTheme } from "@/features/theme/themeSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";
import { SlLocationPin } from "react-icons/sl";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  
  // Get cart items from Redux store
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  // Calculate total quantity from Redux store
  const cartCountFromRedux = cartItems.reduce((total, item) => total + item.qty, 0);
  
  const {
    data: cartData,
    isError: cartError,
    error: cartErr,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/api/cart");
      return response.data as {
        data?: { summary?: { totalItems: number } };
      };
    },
  });
  
  // Use the higher value between Redux store and server data
  const cartCountFromServer = cartError && axios.isAxiosError(cartErr) && cartErr.response?.status === 401
    ? 0
    : (cartData?.data?.summary?.totalItems ?? 0);
    
  // Use Redux count as primary, fall back to server count
  const cartCount = Math.max(cartCountFromRedux, cartCountFromServer);
  
  const theme = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // cleanup (WAJIB)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      setIsLogin(Boolean(token));
      const rawUser =
        localStorage.getItem("auth_user") ||
        sessionStorage.getItem("auth_user");
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser) as {
            name?: string;
            avatar?: string | null;
          };          
          setProfileName(parsed.name || "User");
          setProfileAvatar(parsed.avatar ?? null);
        } catch {
          setProfileName("User");
          setProfileAvatar(null);
        }
      } else {
        setProfileName("User");
        setProfileAvatar(null);
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);

    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "US";

  const getlogoSrc = () => {
    if (isScrolled && theme === "light") {
      return "/images/common/logo-foody.svg";
    } else if (!isScrolled && theme === "light") {
      return "/images/common/logo-foody-white.svg";
    } else if (isScrolled && theme === "dark") {
      return "/images/common/logo-foody.svg";
    } else {
      return "/images/common/logo-foody.svg";
    }
  };

  const getlogoTextColor = () => {
    if (isScrolled && theme === "light") {
      return "text-black";
    } else if (!isScrolled && theme === "light") {
      return "text-white";
    } else if (isScrolled && theme === "dark") {
      return "text-black";
    } else {
      return "text-black";
    }
  };

  const getbuttonTextColor = () => {
    if (isScrolled && theme === "light") {
      return "/images/common/cart-black.svg";
    } else if (!isScrolled && theme === "light") {
      return "/images/common/cart-white.svg";
    } else if (isScrolled && theme === "dark") {
      return "/images/common/cart-black.svg";
    } else {
      return "/images/common/cart-black.svg";
    }
  };

  const getButtonSignInTextColor = () => {
    if (isScrolled && theme === "light") {
      return "text-black";
    } else if (!isScrolled && theme === "light") {
      return "text-white";
    } else if (isScrolled && theme === "dark") {
      return "text-black";
    } else {
      return "text-black";
    }
  };

  const getButtonSignUpTextColor = () => {
    if (isScrolled && theme === "light") {
      return "bg-black text-white";
    } else if (!isScrolled && theme === "light") {
      return "bg-white";
    } else if (isScrolled && theme === "dark") {
      return "bg-black text-white";
    } else {
      return "bg-black text-white";
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 h-16 md:h-22.5 flex justify-between items-center px-4 md:px-30 transition-all duration-300 shadow-md  ${
          isScrolled ? " bg-white" : "bg-transparent "
        }`}
      >
        <>
          <div className="flex flex-row items-center justify-center cursor-pointer">
            <button
              // BACK TO HOME
              onClick={() => navigate("/home")}
              className="flex flex-row items-center justify-center  gap-3.75 cursor-pointer "
              id="home-button"
            >
              <img
                src={getlogoSrc()}
                className="w-10 h-10 md:w-[33.33px] md:h-[31.18px]"
                alt="Your Logo"
              />
              <p
                className={`hidden md:block menu-hover font-semibold text-[32px] leading-10.5 ${getlogoTextColor()}`}
              >
                Foody
              </p>
            </button>
          </div>
          {isLogin && (
            <div className="relative flex flex-row gap-4 md:gap-6 items-center justify-center">
              <div
                className="relative cursor-pointer"
                id="cart-button"
                onClick={() => {
                  if (cartCount > 0) {
                    navigate("/mycart");
                  } else {
                    toast("Your cart is still empty.", {
                      description: "Let's add a favorite menu first!",
                    });
                  }
                }}
              >
                <img
                  src={getbuttonTextColor()}
                  className="w-7 h-7 md:w-8 md:h-8"
                  alt="cart-white"
                />
                {cartCount > 0 && (
                  <div
                    id="cart-container"
                    className="absolute bg-primary-100 w-5 h-5 -right-1 -top-1.5 rounded-full flex items-center justify-center animate-bounce"
                  >
                    <span
                      id="cart-count"
                      className="text-[12px] text-neutral-25"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    id="profile-menu"
                    className="flex flex-row items-center justify-center gap-4 cursor-pointer"
                  >
                    <Avatar className="w-10 h-10 md:h-12 md:w-12">
                      <AvatarImage
                        src={
                          profileAvatar || "/images/common/profile-dummy.svg"
                        }
                        alt={profileName}
                      />
                      <AvatarFallback>
                        {getInitials(profileName)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`hidden md:block font-semibold text-base leading-7.5 -tracking-[0.02em] ${getlogoTextColor()}`}
                    >
                      {profileName}
                    </span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-49.25 rounded-3xl p-4 shadow-lg"
                >
                  {/* USER INFO */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
                    <Avatar className="w-9 h-9">
                      <AvatarImage
                        src={
                          profileAvatar || "/images/common/profile-dummy.svg"
                        }
                        alt={profileName}
                      />
                      <AvatarFallback>
                        {getInitials(profileName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-base leading-7.5 -tracking-[0.02em]">
                      {profileName}
                    </span>
                  </div>
                  {/* MENU ITEMS */}

                  <div className="pt-3 flex flex-col gap-0">
                    <DropdownMenuItem
                      className="gap-3 cursor-pointer rounded-xl"
                      onClick={() => navigate("/myorders/profile")}
                    >
                      <SlLocationPin className="text-xl text-neutral-700" />
                      <span className="text-sm leading-7 font-medium">
                        Delivery Address
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="gap-3 cursor-pointer rounded-xl"
                      onClick={() => navigate("/myorders/orders")}
                    >
                      <IoDocumentTextOutline className="text-xl text-neutral-700" />
                      <span className="text-sm leading-7 font-medium">
                        My Orders
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="gap-3 cursor-pointer rounded-xl text-primary-100 "
                      onClick={() => {
                        localStorage.removeItem("auth_token");
                        localStorage.removeItem("auth_user");
                        sessionStorage.removeItem("auth_token");
                        sessionStorage.removeItem("auth_user");
                        localStorage.removeItem("cart_state");
                        dispatch(clearCart());
                        dispatch(clearFilters());
                        dispatch(setTheme("dark"));
                        setIsLogin(false);
                        navigate("/auth", { state: { tab: "signin" } });
                      }}
                    >
                      <RiLogoutCircleLine className="text-xl" />
                      <span className="text-sm leading-7 font-medium">
                        Logout
                      </span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {!isLogin && (
            <div className="md:flex flex-row gap-4">
              <button
                onClick={() => navigate("/auth", { state: { tab: "signin" } })}
                className={`cursor-pointer py-2 px-5 md:h-12 md:w-40.75 md:px-2 md:py-2 rounded-[100px] ring-2 ring-inset ring-neutral-300 font-bold text-[16px] leading-7.5 -tracking-[0.02em] ${getButtonSignInTextColor()}`}
              >
                Sign In
              </button>
              <span className="md:hidden">&nbsp;&nbsp;&nbsp;</span>
              <button
                onClick={() => navigate("/auth", { state: { tab: "signup" } })}
                className={`cursor-pointer py-2 px-5 md:h-12 ${getButtonSignUpTextColor()} text-black md:w-40.75 md:px-2 md:py-2 rounded-[100px]  font-bold text-[16px] leading-7.5 -tracking-[0.02em]`}
              >
                Sign Up
              </button>
            </div>
          )}
        </>
      </header>
    </>
  );
};
export default Header;