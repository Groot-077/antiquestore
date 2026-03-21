import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  origin: string | null;
  age_years: number | null;
  verification_status: "pending" | "verified" | "rejected";
  quantity: number;
  category_name?: string;
}

export default function ProductCard({ id, name, price, image_url, origin, age_years, verification_status, quantity, category_name }: ProductCardProps) {
  const outOfStock = quantity === 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-destructive">Out of Stock</span>
          </div>
        )}
        {verification_status === "verified" && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" /> Verified
          </Badge>
        )}
        {category_name && (
          <Badge variant="secondary" className="absolute top-3 right-3 text-xs">{category_name}</Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{name}</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-primary">₹{price.toLocaleString("en-IN")}</span>
          {age_years && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {age_years}+ yrs
            </span>
          )}
        </div>
        {origin && <p className="text-xs text-muted-foreground">Origin: {origin}</p>}
      </div>
    </Link>
  );
}
