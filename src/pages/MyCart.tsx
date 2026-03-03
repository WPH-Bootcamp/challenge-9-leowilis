import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  removeItem,
  setItems,
  setCartItemId,
  updateQuantity,
  upsertItem,
} from "@/features/cart/cartSlice";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";

type CartMenu = {
  id: number;
  foodName: string;
  price: number;
  type: "food" | "drink";
  image: string;
};

type CartItem = {
  id: number;
  menu: CartMenu;
  quantity: number;
  itemTotal: number;
};

type CartRestaurant = {
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
  items: CartItem[];
  subtotal: number;
};

type CartResponse = {
  success: boolean;
  message: string;
  data?: {
    cart?: CartRestaurant[];
    summary?: {
      totalItems: number;
      totalPrice: number;
      restaurantCount: number;
    };
  };
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function MyCart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // If no token, return empty cart
        return {
          success: true,
          message: "No token",
          data: { cart: [], summary: { totalItems: 0, totalPrice: 0, restaurantCount: 0 } }
        };
      }
      const response = await api.get<CartResponse>("/api/cart");
      return response.data;
    },
  });

  const errorMessage = (() => {
    if (!isError) return "";
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      if (data?.message) return data.message;
    }
    return "Failed to load cart data.";
  })();

  const shouldLogin = (() => {
    if (!isError) return false;
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { message?: string } | undefined;
      return status === 401 || data?.message === "Access token required";
    }
    return false;
  })();

  // Convert Redux store items to cart groups format
  const reduxCartGroups = useMemo(() => {
    if (cartItems.length === 0) return [];
    
    const grouped = cartItems.reduce((acc, item) => {
      const restaurantId = item.restaurantId;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            id: item.restaurantId,
            name: item.restaurantName,
            logo: "/images/common/icon-restaurant-dummy.svg",
          },
          items: [],
          subtotal: 0,
        };
      }

      acc[restaurantId].items.push({
        id: item.cartItemId || item.menuId,
        menu: {
          id: item.menuId,
          foodName: item.name,
          price: item.price,
          type: "food",
          image: item.image,
        },
        quantity: item.qty,
        itemTotal: item.price * item.qty,
      });

      acc[restaurantId].subtotal += item.price * item.qty;

      return acc;
    }, {} as Record<number, CartRestaurant>);

    return Object.values(grouped);
  }, [cartItems]);

  // Use API data if available, otherwise use Redux store
  const cartGroups = (data?.data?.cart && data.data.cart.length > 0) 
    ? data.data.cart 
    : reduxCartGroups;

  // Sync Redux store with API data when API data is loaded
  useEffect(() => {
    if (data?.data?.cart && data.data.cart.length > 0) {
      const apiItems = data.data.cart.flatMap(group =>
        group.items.map(item => ({
          menuId: item.menu.id,
          cartItemId: item.id,
          name: item.menu.foodName,
          price: item.menu.price,
          image: item.menu.image,
          restaurantId: group.restaurant.id,
          restaurantName: group.restaurant.name,
          qty: item.quantity,
        }))
      );
      
      // Only update if different from current state
      const currentItemIds = cartItems.map(i => i.menuId).sort();
      const apiItemIds = apiItems.map(i => i.menuId).sort();
      
      if (JSON.stringify(currentItemIds) !== JSON.stringify(apiItemIds)) {
        dispatch(setItems(apiItems));
      }
    }
  }, [data, dispatch, cartItems]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { cartItemId: number; quantity: number }) => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // Update locally only
        return {
          success: true,
          data: {
            cartItem: { id: payload.cartItemId, quantity: payload.quantity },
          },
        };
      }
      const response = await api.put(`/api/cart/${payload.cartItemId}`, {
        quantity: payload.quantity,
      });
      return response.data as {
        data?: { cartItem?: { id: number; quantity: number } };
      };
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData(["cart"]);
      const previousItems = cartItems;

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old?.data?.cart) return old;
        const next = old.data.cart.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === payload.cartItemId
              ? { ...item, quantity: payload.quantity }
              : item,
          ),
          subtotal: group.items.reduce((sum, item) => {
            const qty =
              item.id === payload.cartItemId ? payload.quantity : item.quantity;
            return sum + item.menu.price * qty;
          }, 0),
        }));
        return { ...old, data: { ...old.data, cart: next } };
      });

      const target = cartItems.find(
        (item) => item.cartItemId === payload.cartItemId || item.menuId === payload.cartItemId,
      );
      if (target) {
        dispatch(
          updateQuantity({ menuId: target.menuId, qty: payload.quantity }),
        );
      }

      return { previous, previousItems };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      if (context?.previousItems) {
        dispatch(setItems(context.previousItems));
      }
      toast.error("Failed to update cart");
    },
    onSuccess: (data, payload) => {
      const cartItemId = data?.data?.cartItem?.id;
      const quantity = data?.data?.cartItem?.quantity;
      const target = cartItems.find(
        (item) => item.cartItemId === payload.cartItemId || item.menuId === payload.cartItemId,
      );
      if (cartItemId && target) {
        dispatch(setCartItemId({ menuId: target.menuId, cartItemId }));
      }
      if (typeof quantity === "number" && target) {
        dispatch(updateQuantity({ menuId: target.menuId, qty: quantity }));
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload: { cartItemId: number; menuId: number }) => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // Delete locally only
        return { success: true };
      }
      const response = await api.delete(`/api/cart/${payload.cartItemId}`);
      return response.data as { success: boolean };
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData(["cart"]);
      const previousItems = cartItems;

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old?.data?.cart) return old;
        const next = old.data.cart
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.id !== payload.cartItemId),
          }))
          .filter((group) => group.items.length > 0);
        return { ...old, data: { ...old.data, cart: next } };
      });

      dispatch(removeItem(payload.menuId));

      return { previous, previousItems };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      if (context?.previousItems) {
        dispatch(setItems(context.previousItems));
      }
      toast.error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleIncrease = (item: CartItem, group: CartRestaurant) => {
    const nextQty = item.quantity + 1;
    updateMutation.mutate({ cartItemId: item.id, quantity: nextQty });
    dispatch(
      upsertItem({
        menuId: item.menu.id,
        cartItemId: item.id,
        name: item.menu.foodName,
        price: item.menu.price,
        image: item.menu.image,
        restaurantId: group.restaurant.id,
        restaurantName: group.restaurant.name,
        qty: nextQty,
      }),
    );
  };

  const handleDecrease = (item: CartItem, group: CartRestaurant) => {
    const nextQty = item.quantity - 1;
    if (nextQty <= 0) {
      deleteMutation.mutate({ cartItemId: item.id, menuId: item.menu.id });
      return;
    }
    updateMutation.mutate({ cartItemId: item.id, quantity: nextQty });
    dispatch(
      upsertItem({
        menuId: item.menu.id,
        cartItemId: item.id,
        name: item.menu.foodName,
        price: item.menu.price,
        image: item.menu.image,
        restaurantId: group.restaurant.id,
        restaurantName: group.restaurant.name,
        qty: nextQty,
      }),
    );
  };

  // Show empty cart message
  const showEmptyCart = !isLoading && !isError && cartGroups.length === 0;

  return (
    <main className="w-full px-4 md:px-30  pt-4 md:pt-0 md:mt-32 mt-16 flex flex-col gap-4 md:gap-8 text-neutral-950 md:items-center mb-12 md:mb-25">
      <div className="flex flex-col gap-4 md:gap-8 md:w-200">
        <h1 className="font-extrabold text-2xl leading-9 md:text-[32px] md:leading-10.5">
          My Cart
        </h1>

        <div className="flex flex-col gap-5">
          {isLoading && (
            <>
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex flex-col gap-3 md:gap-5 py-4 px-4 shadow-sm rounded-3xl h-fit"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  {Array.from({ length: 2 }).map((__, idx) => (
                    <div
                      key={`item-${idx}`}
                      className="flex flex-row justify-between"
                    >
                      <div className="flex flex-row gap-4.25">
                        <Skeleton className="w-16 h-16 md:h-20 md:w-20 rounded-2xl" />
                        <div className="flex flex-col justify-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </>
          )}

          {isError && !shouldLogin && (
            <Alert variant="destructive">
              <AlertTitle>Failed to load cart</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {shouldLogin && (
            <Alert>
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                Please login to sync your cart across devices.
              </AlertDescription>
              <div className="pt-3">
                <Button
                  onClick={() =>
                    navigate("/auth", { state: { tab: "signin" } })
                  }
                  className="h-9 rounded-[100px] bg-primary-100 text-white font-bold text-[14px] leading-7 -tracking-[0.02em]"
                >
                  Login to sync cart
                </Button>
              </div>
            </Alert>
          )}

          {showEmptyCart && (
            <div className="flex flex-col gap-4 p-8 rounded-3xl shadow-sm items-center justify-center">
              <img
                src="/images/common/empty-cart.svg"
                alt="Empty cart"
                className="w-32 h-32 opacity-50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h2 className="text-xl font-bold">Your cart is empty</h2>
              <p className="text-gray-600 text-center">
                Start adding delicious items to your cart!
              </p>
              <Button
                onClick={() => navigate("/")}
                className="h-11 px-8 rounded-full bg-primary-100 text-white font-bold"
              >
                Browse Restaurants
              </Button>
            </div>
          )}

          {!isLoading &&
            cartGroups.length > 0 &&
            cartGroups.map((group) => (
              <div
                key={group.restaurant.id}
                className="flex flex-col gap-3 md:gap-5 py-4 px-4 shadow-sm rounded-3xl h-fit"
              >
                <div
                  id="restaurant-header"
                  className="flex flex-row gap-1 items-center md:gap-2 cursor-pointer"
                  onClick={() => navigate(`/details/${group.restaurant.id}`)}
                >
                  <img
                    src={
                      group.restaurant.logo ||
                      "/images/common/icon-restaurant-dummy.svg"
                    }
                    className="w-8 h-8"
                    alt={group.restaurant.name}
                  />
                  <span className="font-bold text-base leading-7.5 -tracking-[0.02em] md:text-lg md:leading-8 md:-tracking-[0.03em] ">
                    {group.restaurant.name}
                  </span>
                  <img
                    src="/images/common/chevron-right.svg"
                    className="w-5 h-5"
                    alt="pointer-right"
                  />
                </div>

                {group.items.map((item) => (
                  <div key={item.id} className="flex flex-row justify-between">
                    <div className="flex flex-row gap-4.25">
                      <div
                        className="bg-cover bg-center bg-no-repeat text-xl w-16 h-16 md:h-20 md:w-20 rounded-2xl"
                        style={{
                          backgroundImage: `url('${item.menu.image}')`,
                        }}
                      />
                      <div className="flex flex-col justify-center">
                        <span className="font-medium text-sm leading-7 md:text-base md:leading-7.5 -tracking-[0.03em]">
                          {item.menu.foodName}
                        </span>
                        <span className="font-extrabold text-base leading-7.5 md:text-lg md:leading-8 -tracking-[0.02em]">
                          {formatRupiah(item.menu.price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 py-6">
                      <button
                        onClick={() => handleDecrease(item, group)}
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                        className="h-9 w-9 ring-1 ring-inset ring-neutral-300 rounded-full flex items-center justify-center cursor-pointer md:h-10 md:w-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src="/images/common/minus.svg"
                          alt="decrease"
                          className="w-[19.5px] h-[19.5px] md:w-6 md:h-6"
                        />
                      </button>
                      <div className="text-[16px] leading-7.5 -tracking-[0.02em] font-semibold md:text-[18px] md:leading-8 md:-tracking-[0.02em] min-w-5 text-center">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => handleIncrease(item, group)}
                        disabled={updateMutation.isPending}
                        className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer  md:h-10 md:w-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src="/images/common/plus.svg"
                          alt="increase"
                          className="w-[19.5px] h-[19.5px] md:w-6 md:h-6"
                        />
                      </button>
                    </div>
                  </div>
                ))}

                <hr className="border-t border-dashed border-neutral-300" />
                <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                  <div className="flex flex-col gap-0">
                    <span className="text-sm leading-7 font-medium -mb-1 md:text-base md:leading-7.5 -tracking-[0.03em]">
                      Total
                    </span>
                    <span className="font-extrabold text-lg leading-8 -tracking-[0.02em] md:text-xl md:leading-8.5">
                      {formatRupiah(group.subtotal)}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const groupSummary = {
                        totalItems: group.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        ),
                        totalPrice: group.subtotal,
                        restaurantCount: 1,
                      };

                      navigate("/checkout", {
                        state: {
                          cart: [group],
                          summary: groupSummary,
                        },
                      });
                    }}
                    className="h-11 md:h-12 w-full md:w-60 rounded-[100px] bg-primary-100 text-white font-bold text-[14px] leading-7 -tracking-[0.02em] items-center justify-center text-center md:text-[16px] md:leading-7.5 md:-tracking-[0.02em] cursor-pointer"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}