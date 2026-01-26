import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/app/store";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FilterLeftMenu from "@/components/container/FilterLeftMenu";

type RestaurantItem = {
  id: number;
  name: string;
  star: number;
  place: string;
  logo: string;
  images: string[];
  category: string;
  reviewCount: number;
  menuCount: number;
  priceRange?: { min: number; max: number };
};

type CategoryResponse = {
  success: boolean;
  message: string;
  data?: {
    restaurants?: RestaurantItem[];
  };
};

export default function Category() {
  const navigate = useNavigate();
  const filters = useSelector((state: RootState) => state.categoryFilters);

  const buildParams = () => {
    const params: Record<string, number> = { page: 1, limit: 20 };
    if (filters.distance !== null) {
      params.range = filters.distance === "nearby" ? 0 : filters.distance;
    }
    if (filters.priceMin.trim() !== "") {
      const value = Number(filters.priceMin);
      if (!Number.isNaN(value)) params.priceMin = value;
    }
    if (filters.priceMax.trim() !== "") {
      const value = Number(filters.priceMax);
      if (!Number.isNaN(value)) params.priceMax = value;
    }
    if (filters.rating !== null) {
      params.rating = filters.rating;
    }
    return params;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category-resto", filters],
    queryFn: async () => {
      const response = await api.get<CategoryResponse>("/api/resto", {
        params: buildParams(),
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
    return "Failed to load data.";
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

  const restaurants = data?.data?.restaurants ?? [];

  return (
    <main className="w-full px-4 md:px-30 md:mt-32 pt-4 md:pt-0 mt-16 flex flex-col gap-4 md:gap-8 text-neutral-950 mb-12 md:mb-25">
      <div className="flex flex-col gap-4">
        <h1 className="text-[24px] leading-9 font-extrabold">All Restaurant</h1>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <div className="flex flex-row justify-between px-3 py-3 items-center shadow-sm rounded-2xl">
              <span className="font-extrabold text-[14px] leading-7">
                Filter
              </span>
              <img
                src="/images/common/filter.svg"
                alt="filter"
                className="w-5 h-5"
              />
            </div>
          </SheetTrigger>

          <SheetContent side="left" className="w-74.5 p-4">
            <div className="pt-4">
              <FilterLeftMenu />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-row gap-10">
          <div className="hidden md:flex shadow-md w-66.5 min-w-66.5 p-4 rounded-3xl">
            <FilterLeftMenu />
          </div>
          <div className="flex flex-col gap-4 w-full md:grid md:grid-cols-2 md:gap-6 h-fit ">
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex flex-row gap-2 px-3 py-3 shadow-sm rounded-3xl"
                  >
                    <Skeleton className="rounded-2xl w-22.5 h-22.5" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {isError && (
              <div className="md:col-span-2">
                <Alert variant="destructive">
                  <AlertTitle>Failed to load data.</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                  {shouldLogin && (
                    <div className="pt-3">
                      <Button
                        onClick={() =>
                          navigate("/auth", { state: { tab: "signin" } })
                        }
                        className="h-9 rounded-[100px] bg-primary-100 text-white font-bold text-[14px] leading-7 -tracking-[0.02em]"
                      >
                        Login to view data
                      </Button>
                    </div>
                  )}
                </Alert>
              </div>
            )}

            {!isLoading &&
              !isError &&
              restaurants.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-row gap-2 px-3 py-3 shadow-sm rounded-3xl h-fit cursor-pointer"
                  onClick={() => navigate(`/details/${item.id}`)}
                >
                  <img
                    src={item.logo || "/images/common/restaurant-dummy.svg"}
                    className="rounded-2xl w-22.5 h-22.5 object-cover"
                    alt={item.name}
                  />
                  <div className="flex flex-col gap-0.5 w-full">
                    <h3 className="text-neutral-950 font-extrabold text-[16px] leading-7.5 md:text-[18px] md:leading-8 -tracking-[0.02em]">
                      {item.name}
                    </h3>
                    <div className="flex flex-row gap-1">
                      <img
                        src="/images/common/star.svg"
                        className="w-6 h-6"
                        alt="star"
                      />
                      <span className="text-neutral-950 font-medium leading-7 text-[14px] md:text-[16px] md:leading-7.5 -tracking-[0.03em]">
                        {item.star}
                      </span>
                    </div>
                    <div className="flex flex-row gap-1.5 items-center justify-start w-fit">
                      <span className="text-neutral-950 text-[14px] leading-7 -tracking-[-0.02em] md:text-[16px] md:leading-7.5">
                        {item.place}
                      </span>
                      <div className="flex flex-row w-fit items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-neutral-950"></div>
                      </div>
                      <span className="text-neutral-950 text-[14px] leading-7 -tracking-[-0.02em] md:text-[16px] md:leading-7.5">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
