import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  menuId: number;
  cartItemId?: number;
  name: string;
  price: number;
  image: string;
  restaurantId: number;
  restaurantName: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

const loadCartState = (): CartState => {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem("cart_state");
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    return { items: parsed.items ?? [] };
  } catch {
    return { items: [] };
  }
};

const saveCartState = (state: CartState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart_state", JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
};

const initialState: CartState = loadCartState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      saveCartState(state);
    },
    upsertItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) => item.menuId === action.payload.menuId,
      );
      if (existing) {
        existing.qty = action.payload.qty;
        existing.cartItemId = action.payload.cartItemId ?? existing.cartItemId;
        existing.name = action.payload.name;
        existing.price = action.payload.price;
        existing.image = action.payload.image;
        existing.restaurantId = action.payload.restaurantId;
        existing.restaurantName = action.payload.restaurantName;
      } else {
        state.items.push(action.payload);
      }
      saveCartState(state);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ menuId: number; qty: number }>,
    ) {
      const existing = state.items.find(
        (item) => item.menuId === action.payload.menuId,
      );
      if (existing) {
        existing.qty = action.payload.qty;
      }
      saveCartState(state);
    },
    setCartItemId(
      state,
      action: PayloadAction<{ menuId: number; cartItemId: number }>,
    ) {
      const existing = state.items.find(
        (item) => item.menuId === action.payload.menuId,
      );
      if (existing) {
        existing.cartItemId = action.payload.cartItemId;
      }
      saveCartState(state);
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.menuId !== action.payload);
      saveCartState(state);
    },
    clearCart(state) {
      state.items = [];
      saveCartState(state);
    },
  },
});

export const {
  setItems,
  upsertItem,
  updateQuantity,
  setCartItemId,
  removeItem,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
export type { CartItem };
