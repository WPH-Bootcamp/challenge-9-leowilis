import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function BlankLayout() {
  const location = useLocation();
  const topLevelKey = location.pathname.split("/")[1] || "blank";

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={topLevelKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
