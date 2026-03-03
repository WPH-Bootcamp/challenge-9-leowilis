import dayjs from "dayjs";
import "dayjs/locale/id";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (iso: string) =>
  dayjs(iso).locale("id").format("DD MMMM YYYY, HH:mm");

type SuccessPayload = {
  date: string;
  paymentMethod: string;
  totalItems: number;
  price: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
};

export default function Success() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("checkout_success");
  const data = raw ? (JSON.parse(raw) as SuccessPayload) : null;
  const fallback: SuccessPayload = {
    date: dayjs().toISOString(),
    paymentMethod: "Bank Negara Indonesia",
    totalItems: 0,
    price: 0,
    deliveryFee: 15000,
    serviceFee: 5000,
    total: 0,
  };
  const payload = data ?? fallback;

  return (
    <main className="min-h-screen w-full bg-[#FAFAFA] flex flex-col items-center justify-center px-4  text-neutral-950 gap-7">
      <div
        className="flex items-center gap-3 cursor-pointer"
        id="foody-header"
        onClick={() => navigate("/home")}
      >
        <img
          src="/images/common/logo-foody.svg"
          alt="Foody"
          className="w-7 h-7 md:w-10.5 md:h-10.5"
        />
        <span className="text-2xl  md:text-[32px] leading-10.5 font-extrabold">
          Foody
        </span>
      </div>

      <section className="w-full md:w-107 bg-white rounded-3xl shadow-sm px-4 py-4 md:px-5 md:py-5 relative gap-4">
        <div className="flex flex-col items-center text-center gap-0">
          <img
            src="/images/common/green-checked.svg"
            alt="success-payment"
            className="w-16 h-16"
          />
          <h1 className="text-lg font-extrabold leading-8 -tracking-[0.02em] md:text-xl md:leading-8.5">
            Payment Success
          </h1>
          <p className="text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
            Your payment has been successfully processed.
          </p>
        </div>

        <div className="relative mt-4 pt-4 border-t border-dashed border-neutral-200">
          <span className="absolute -left-4 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#FAFAFA] rounded-full" />
          <span className="absolute -right-4 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#FAFAFA] rounded-full" />

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm leading-7 font-medium">Date</span>
              <span className="font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {formatDate(payload.date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm leading-7 font-medium">
                Payment Method
              </span>
              <span className="font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {payload.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm leading-7 font-medium">
                Price ( {payload.totalItems} items)
              </span>
              <span className="font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {formatRupiah(payload.price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm leading-7 font-medium">
                Delivery Fee
              </span>
              <span className="font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {formatRupiah(payload.deliveryFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm leading-7 font-medium">Service Fee</span>
              <span className="font-semibold text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[0.02em]">
                {formatRupiah(payload.serviceFee)}
              </span>
            </div>
          </div>
        </div>

        <div className="relative pt-4 mt-4 border-t border-dashed border-neutral-200">
          <span className="absolute -left-4 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-5 bg-[#FAFAFA] rounded-full" />
          <span className="absolute -right-4 top-0 translate-x-1/2 -translate-y-1/2 w-4 h-5 bg-[#FAFAFA] rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-base font-normal leading-7.5 -tracking-[0.02em] md:text-lg md:leading-8">
              Total
            </span>
            <span className="text-base font-extrabold leading-7.5 md:text-lg md:leading-8 -tracking-[0.02em] ">
              {formatRupiah(payload.total)}
            </span>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={() => navigate("/myorders/orders")}
          className="
    mt-4 w-full h-11 rounded-full
    bg-[#C21E15] text-white
    font-bold text-base leading-7.5 -tracking-[0.02em]
    cursor-pointer
  "
        >
          See My Orders
        </Button>
      </section>
    </main>
  );
}
