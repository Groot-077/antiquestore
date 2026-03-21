import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export default function StarRating({ rating, onChange, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={cn("transition-colors", onChange && "cursor-pointer hover:scale-110 active:scale-95")}
        >
          <Star
            className={cn(
              starSize,
              star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
