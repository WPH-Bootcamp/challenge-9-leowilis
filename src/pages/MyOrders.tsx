import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewModal from "@/components/popup/ReviewModal";

type OrderItem = {
  menuId: number;
  menuName: string;
  price: number;
  image: string;
  quantity: number;
  itemTotal: number;
};

type OrderRestaurant = {
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
  items: OrderItem[];
  subtotal: number;
};

type Order = {
  id: number;
  transactionId: string;
  status: "done" | "preparing" | "on_the_way" | "delivered" | "cancelled";
  paymentMethod: string;
  deliveryAddress: string;
  phone: string;
  pricing: {
    subtotal: number;
    serviceFee: number;
    deliveryFee: number;
    totalPrice: number;
  };
  restaurants: OrderRestaurant[];
  createdAt: string;
  updatedAt: string;
};

type OrdersResponse = {
  success: boolean;
  message: string;
  data?: {
    orders?: Order[];
  };
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function MyOrders() {
  const [openReview, setOpenReview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<
    "done" | "preparing" | "on_the_way" | "delivered" | "cancelled"
  >("done");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-orders", status],
    queryFn: async () => {
      const response = await api.get<OrdersResponse>("/api/order/my-order", {
        params: { status, page: 1, limit: 50 },
      });
      return response.data;
    },
  });

  const errorMessage = (() => {
    if (!isError) return "";
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      if (data?.message) return data.message;
    }
    return "Failed to load transaction data.";
  })();

  const shouldLogin = (() => {
    if (!isError) return false;
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const data = error.response?.data as { message?: string } | undefined;
      return statusCode === 401 || data?.message === "Access token required";
    }
    return false;
  })();

  const orders = data?.data?.orders ?? [];
  const statusOptions: { label: string; value: typeof status }[] = [
    { label: "Preparing", value: "preparing" },
    { label: "On The Way", value: "on_the_way" },
    { label: "Delivered", value: "delivered" },
    { label: "Done", value: "done" },
    { label: "Canceled", value: "cancelled" },
  ];
  const statusLabel =
    status === "on_the_way"
      ? "On The Way"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <>
      <article className="flex flex-col gap-4 md:gap-6 mt-4 md:mt-0 mb-12 md:mb-25">
        <h1 className=" font-extrabold text-2xl leading-9 md:text-[32px] md:leading-10.5 ">
          My Orders
        </h1>
        <div className="flex flex-col gap-5 p-4 md:p-6 bg-white rounded-2xl shadow-md ">
          {/* Search Bar */}
          <div className="relative w-full md:w-149.5 ">
            <img
              src="/images/common/search.svg"
              alt="search"
              className="absolute left-4 top-2.5 w-6 h-6 z-10"
            />

            <input
              id="searchInput"
              name="searchInput"
              type="text"
              placeholder="Search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="ring-1 ring-inset ring-neutral-300 ring-neutral w-full h-11 rounded-full pl-13 text-[14px] leading-7   bg-white text-black
   focus:ring-2  placeholder:text-neutral-600 -tracking-[0.02em]"
            />
          </div>
          {/* Status */}
          <div className="flex flex-row gap-2 items-center overflow-x-auto no-scrollbar md:gap-3">
            <span className="font-bold text-sm leading-7 -tracking-[0.02em] md:text-lg md:leading-8 md:-tracking-[0.03em]">
              Status
            </span>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={`h-10 px-4 py-2 md:h-10 rounded-full ring-1 ring-inset flex items-center justify-center font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em] cursor-pointer ${
                  status === option.value
                    ? "ring-primary-100 bg-[#FFECEC] text-primary-100"
                    : "ring-neutral-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Order List */}
          {isLoading && (
            <div className="flex flex-col gap-3 shadow-lg p-4 rounded-3xl">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex flex-row gap-3">
                  <Skeleton className="w-16 h-16 md:h-20 md:w-20 rounded-2xl" />
                  <div className="flex flex-col justify-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Failed to load transaction</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
              {shouldLogin && (
                <div className="pt-3">
                  <Button
                    onClick={() => window.location.assign("/auth")}
                    className="h-9 rounded-[100px] bg-primary-100 text-white font-bold text-[14px] leading-7 -tracking-[0.02em]"
                  >
                    Login to view transactions
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {!isLoading &&
            !isError &&
            orders.filter((order) => {
              if (!keyword.trim()) return true;
              const query = keyword.toLowerCase();
              return order.restaurants.some(
                (group) =>
                  group.restaurant.name.toLowerCase().includes(query) ||
                  group.items.some((item) =>
                    item.menuName.toLowerCase().includes(query),
                  ),
              );
            }).length === 0 && (
              <Alert>
                <AlertTitle>No orders yet</AlertTitle>
                <AlertDescription>
                  There are no transactions yet for status {statusLabel}. Explore your favorite menu and place your order!
                </AlertDescription>
              </Alert>
            )}

          {!isLoading &&
            !isError &&
            orders
              .filter((order) => {
                if (!keyword.trim()) return true;
                const query = keyword.toLowerCase();
                return order.restaurants.some(
                  (group) =>
                    group.restaurant.name.toLowerCase().includes(query) ||
                    group.items.some((item) =>
                      item.menuName.toLowerCase().includes(query),
                    ),
                );
              })
              .map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 shadow-lg p-4 rounded-3xl"
                >
                  {order.restaurants.map((group) => (
                    <div
                      key={`${order.id}-${group.restaurant.id}`}
                      className="flex flex-col gap-3 md:gap-4"
                    >
                      <div className="flex flex-row justify-between items-center just">
                        <div className="flex flex-row gap-2 items-center">
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
                        </div>
                      </div>
                      {group.items.map((item) => (
                        <div key={item.menuId} className="flex flex-row gap-3">
                          <div
                            className="bg-cover bg-center bg-no-repeat text-xl w-16 h-16 md:h-20 md:w-20 rounded-2xl"
                            style={{
                              backgroundImage: `url('${item.image}')`,
                            }}
                          />
                          <div className="flex flex-col justify-center">
                            <span className="font-medium text-sm leading-7 md:text-base md:leading-7.5 -tracking-[0.03em]">
                              {item.menuName}
                            </span>
                            <span className="font-extrabold text-base leading-7.5 md:text-lg md:leading-8 -tracking-[0.02em]">
                              {formatRupiah(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <hr />
                  <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                    <div className="flex flex-col gap-0">
                      <span className="text-sm leading-7 font-medium -mb-1 md:text-base md:leading-7.5 -tracking-[0.03em]">
                        Total
                      </span>
                      <span className="font-extrabold text-lg leading-8 -tracking-[0.02em] md:text-xl md:leading-8.5">
                        {formatRupiah(order.pricing.totalPrice)}
                      </span>
                    </div>
                    {order.status === "done" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpenReview(true);
                        }}
                        className="
    h-11 md:h-12 w-full md:w-60 rounded-[100px]
    bg-primary-100 text-white
    font-bold text-[14px] leading-7 -tracking-[0.02em]
    md:text-[16px] md:leading-7.5 md:-tracking-[0.02em]
    cursor-pointer
  "
                      >
                        Give Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </article>
      <ReviewModal
        open={openReview}
        onOpenChange={setOpenReview}
        order={selectedOrder}
      />
    </>
  );
}
