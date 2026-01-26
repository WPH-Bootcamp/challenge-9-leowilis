import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DistanceFilter = "nearby" | 1 | 3 | 5 | null;

type CategoryFilterState = {
  distance: DistanceFilter;
  priceMin: string;
  priceMax: string;
  rating: number | null;
};

const initialState: CategoryFilterState = {
  distance: null,
  priceMin: "",
  priceMax: "",
  rating: null,
};

const categoryFilterSlice = createSlice({
  name: "categoryFilters",
  initialState,
  reducers: {
    setDistance(state, action: PayloadAction<DistanceFilter>) {
      state.distance = action.payload;
    },
    setPriceMin(state, action: PayloadAction<string>) {
      state.priceMin = action.payload;
    },
    setPriceMax(state, action: PayloadAction<string>) {
      state.priceMax = action.payload;
    },
    setRating(state, action: PayloadAction<number | null>) {
      state.rating = action.payload;
    },
    clearFilters(state) {
      state.distance = null;
      state.priceMin = "";
      state.priceMax = "";
      state.rating = null;
    },
  },
});

export const {
  setDistance,
  setPriceMin,
  setPriceMax,
  setRating,
  clearFilters,
} = categoryFilterSlice.actions;
export default categoryFilterSlice.reducer;
export type { CategoryFilterState, DistanceFilter };
