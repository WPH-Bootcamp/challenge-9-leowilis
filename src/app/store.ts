import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";
import themeReducer from "@/features/theme/themeSlice";
import cartReducer from "@/features/cart/cartSlice";
import categoryFilterReducer from "@/features/filters/categoryFilterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    theme: themeReducer,
    cart: cartReducer,
    categoryFilters: categoryFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
