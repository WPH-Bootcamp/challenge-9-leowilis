import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlLocationPin } from "react-icons/sl";

import { IoDocumentTextOutline } from "react-icons/io5";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import { clearFilters } from "@/features/filters/categoryFilterSlice";
import { setTheme } from "@/features/theme/themeSlice";

export default function MyOrdersLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileName, setProfileName] = useState("User");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = () => {
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

    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "US";

  return (
    <main className="w-full px-4 md:px-30 mt-16 md:mt-32 flex flex-row gap-6 md:gap- text-neutral-950 ">
      {/* LEFT SIDEBAR */}
      <aside className="h-fit rounded-3xl bg-white shadow-lg p-5 md:flex flex-col gap-6 w-60 hidden sticky top-32">
        <div className="flex flex-row items-center gap-2" id="profile-header">
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat flex items-center justify-center text-xs font-bold text-white"
            style={{
              backgroundImage: `url('${
                profileAvatar || "/images/common/profile-dummy.svg"
              }')`,
            }}
          >
            {!profileAvatar && getInitials(profileName)}
          </div>
          <div className="font-bold text-md">{profileName}</div>
        </div>
        <hr />

        <nav className="flex flex-col gap-6">
          <NavLink
            to="profile"
            className={({ isActive }) =>
              isActive ? "text-primary-100" : "text-neutral-950"
            }
          >
            <div className="flex flex-row items-center gap-2 ">
              <SlLocationPin className="w-6 h-6" />
              <span className="text-base leading-7.5 -tracking-[0.03em] ">
                Delivery Address
              </span>
            </div>
          </NavLink>
          <NavLink
            to="orders"
            className={({ isActive }) =>
              isActive ? "text-primary-100" : "text-neutral-950"
            }
          >
            <div className="flex flex-row items-center gap-2 ">
              <IoDocumentTextOutline className="w-6 h-6" />
              <span className="text-base leading-7.5 -tracking-[0.03em] ">
                My Orders
              </span>
            </div>
          </NavLink>
          <NavLink
            to="/auth"
            className="text-neutral-950"
            onClick={() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("auth_user");
              sessionStorage.removeItem("auth_token");
              sessionStorage.removeItem("auth_user");
              localStorage.removeItem("cart_state");
              dispatch(clearCart());
              dispatch(clearFilters());
              dispatch(setTheme("dark"));
              navigate("/auth", { state: { tab: "signin" } });
            }}
          >
            <div className="flex flex-row items-center gap-2 ">
              <RiLogoutCircleLine className="w-6 h-6 " />
              <span className="text-base leading-7.5 -tracking-[0.03em]">
                Logout
              </span>
            </div>
          </NavLink>
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <section className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 1, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

