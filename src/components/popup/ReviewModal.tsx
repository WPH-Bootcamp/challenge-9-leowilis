import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { IoIosClose } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";

type ReviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: number;
    transactionId: string;
    restaurants: {
      restaurant: { id: number; name: string; logo: string };
      items: { menuId: number }[];
    }[];
  } | null;
};

type MyReview = {
  id: number;
  star: number;
  comment: string;
  transactionId: string;
};

type ReviewsResponse = {
  success: boolean;
  message: string;
  data?: {
    reviews?: MyReview[];
  };
};

export default function ReviewModal({
  open,
  onOpenChange,
  order,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const response = await api.get<ReviewsResponse>(
        "/api/review/my-reviews",
        {
          params: { page: 1, limit: 50 },
        },
      );
      return response.data;
    },
    enabled: open,
  });

  const reviewMap = useMemo(() => {
    const reviews = data?.data?.reviews ?? [];
    return new Map(reviews.map((review) => [review.transactionId, review]));
  }, [data]);

  useEffect(() => {
    if (!open || !order) return;
    const existing = reviewMap.get(order.transactionId);
    if (existing) {
      setRating(existing.star);
      setComment(existing.comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [open, order, reviewMap]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("Order tidak ditemukan.");
      const restaurant = order.restaurants[0]?.restaurant;
      const menuIds = order.restaurants.flatMap((group) =>
        group.items.map((item) => item.menuId),
      );
      const response = await api.post("/api/review", {
        transactionId: order.transactionId,
        restaurantId: restaurant?.id,
        star: rating,
        comment,
        menuIds,
      });
      return response.data as { message?: string };
    },
    onSuccess: () => {
      toast("Review submitted successfully");
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await api.put(`/api/review/${reviewId}`, {
        star: rating,
        comment,
      });
      return response.data as { message?: string };
    },
    onSuccess: () => {
      toast("Review successfully updated");
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (!order) return;
    if (rating === 0) {
      toast("Silakan pilih rating terlebih dahulu");
      return;
    } else if (comment.trim() === "") {
      toast("Please fill in the comments first");
      return;
    }
    const existing = reviewMap.get(order.transactionId);
    if (existing) {
      updateMutation.mutate(existing.id);
    } else {
      createMutation.mutate();
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="rounded-3xl sm:max-w-lg md:w-109.75 overflow-y-auto no-scrollbar"
      >
        <div className="flex flex-col md:gap-6 gap-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="md:text-2xl font-extrabold md:leading-9 text-xl leading-8.5">
              Give Review
            </h1>
            <DialogClose asChild>
              <IoIosClose className="w-8 h-8 cursor-pointer" />
            </DialogClose>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-extrabold text-base leading-7.5">
              Give Rating
            </h2>
            <div className="flex flex-row gap-[4.08px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 p-1 cursor-pointer ${
                    (hoverRating || rating) >= star
                      ? "text-[#FDB022]"
                      : "text-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>
          <textarea
            className="h-58.75 ring-1 ring-inset ring-neutral-300 rounded-2xl p-3 resize-none placeholder:text-neutral-400 text-sm leading-7 -tracking-[0.02em] "
            placeholder="Please share your thoughts about our service!"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="
    h-11 md:h-12 w-full rounded-[100px]
    bg-primary-100 text-white font-bold
    text-[14px] leading-7 -tracking-[0.02em]
    md:text-[16px] md:leading-7.5 md:-tracking-[0.02em]
    cursor-pointer
    disabled:opacity-60 disabled:cursor-not-allowed
  "
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
