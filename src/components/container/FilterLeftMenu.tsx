import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  setDistance,
  setPriceMax,
  setPriceMin,
  setRating,
  type DistanceFilter,
} from "@/features/filters/categoryFilterSlice";

const FilterLeftMenu = () => {
  const dispatch = useDispatch();
  const { distance, priceMin, priceMax, rating } = useSelector(
    (state: RootState) => state.categoryFilters,
  );

  const distanceOptions: { label: string; value: DistanceFilter }[] = [
    { label: "Nearby", value: "nearby" },
    { label: "Within 1 km", value: 1 },
    { label: "Within 3 km", value: 3 },
    { label: "Within 5 km", value: 5 },
  ];

  return (
    <div className="flex flex-col  gap-3 md:gap-6">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[16px] font-bold leading-7.5 -tracking-[0.02em] md:font-extrabold">
          FILTER
        </h1>

        <h1 className="text-[16px] md:text-lg font-extrabold leading-7.5 md:-tracking-[0.02em] ">
          Distance
        </h1>

        {/* Distance */}
        <div className="flex flex-col gap-2.5 text-neutral-950">
          {distanceOptions.map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={distance === option.value}
                onCheckedChange={() =>
                  dispatch(
                    setDistance(
                      distance === option.value ? null : option.value,
                    ),
                  )
                }
              />
              <span className="text-sm md:text-[16px] leading-7 -tracking-[0.02em] md:leading-7.5">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="md:w-[115%] md:-ml-[7%]" />

      {/* PRICE */}
      <div className="flex flex-col gap-2.5">
        <h3 className="font-extrabold text-[16px] leading-7.5">Price</h3>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border rounded-xl px-2 py-2 h-12">
            <div className="bg-neutral-100 w-9.5 h-9.5 rounded-lg flex items-center justify-center  px-2 py-2 font-semibold leading-7 -tracking-[0.02em] text-[14px] md:text-base md:leading-7.5">
              Rp
            </div>
            <Input
              placeholder="Minimum Price"
              className="border-0 shadow-none focus-visible:ring-0 pl-0 placeholder:text-neutral-500"
              value={priceMin}
              onChange={(e) => dispatch(setPriceMin(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 border rounded-xl px-2 py-2 h-12">
            <div className="bg-neutral-100 w-9.5 h-9.5 rounded-lg flex items-center justify-center  px-2 py-2 font-semibold leading-7 -tracking-[0.02em] text-[14px] md:text-base md:leading-7.5">
              Rp
            </div>
            <Input
              placeholder="Maximum Price"
              className="border-0 shadow-none focus-visible:ring-0 pl-0 placeholder:text-neutral-500"
              value={priceMax}
              onChange={(e) => dispatch(setPriceMax(e.target.value))}
            />
          </div>
        </div>
      </div>
      <hr className="md:w-[115%] md:-ml-[7%]" />

      {/* RATING */}
      <div className="flex flex-col gap-2.5">
        <h3 className="font-extrabold text-[16px] leading-7.5 ">Rating</h3>

        {[5, 4, 3, 2, 1].map((rate) => (
          <label
            key={rate}
            className="flex items-center gap-2 cursor-pointer px-1 py-1"
          >
            <Checkbox
              checked={rating === rate}
              onCheckedChange={() =>
                dispatch(setRating(rating === rate ? null : rate))
              }
            />
            <div className="flex items-center gap-1">
              <img
                src="/images/common/star.svg"
                className="w-6 h-6"
                alt="star"
              />
              <span className="text-sm md:text-base md:leading-7.5 leading-7 -tracking-[0.02em] ">
                {rate}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterLeftMenu;
