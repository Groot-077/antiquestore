import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import StarRating from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, ShieldCheck, AlertTriangle, Clock, MapPin, Tag, User } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      if (user) trackView();
    }
  }, [id, user]);

  async function fetchProduct() {
    const { data } = await supabase.from("products").select("*, categories(name)").eq("id", id).single();
    setProduct(data);
    if (data) {
      const { data: sellerData } = await supabase.from("profiles").select("*").eq("id", data.seller_id).single();
      setSeller(sellerData);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    const { data } = await supabase.from("reviews").select("*, profiles(display_name)").eq("product_id", id).order("created_at", { ascending: false });
    setReviews(data || []);
  }

  async function trackView() {
    await supabase.from("recently_viewed").upsert({ user_id: user!.id, product_id: id!, viewed_at: new Date().toISOString() }, { onConflict: "user_id,product_id" });
  }

  async function addToCart() {
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: id!, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) toast.error("Failed to add to cart");
    else toast.success("Added to cart!");
  }

  async function addToWishlist() {
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: id! });
    if (error) {
      if (error.code === "23505") toast.info("Already in your wishlist");
      else toast.error("Failed to add");
    } else toast.success("Added to wishlist!");
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("reviews").insert({ user_id: user.id, product_id: id!, rating: reviewRating, comment: reviewComment });
    if (error) {
      if (error.code === "23505") toast.info("You've already reviewed this item");
      else toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      fetchReviews();
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("reports").insert({ reporter_id: user.id, product_id: id!, reason: reportReason });
    if (error) toast.error("Failed to submit report");
    else { toast.success("Report submitted. Admin will review."); setShowReport(false); setReportReason(""); }
  }

  if (loading) return <Layout><div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!product) return <Layout><div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Product not found</div></Layout>;

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-muted aspect-square">
            <img src={product.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {product.categories?.name && <Badge variant="secondary" className="mb-2">{product.categories.name}</Badge>}
              <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={Math.round(avgRating)} size="sm" />
                    <span className="text-sm text-muted-foreground">({reviews.length})</span>
                  </div>
                )}
                {product.verification_status === "verified" && (
                  <Badge className="bg-accent text-accent-foreground gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                )}
                {product.verification_status === "pending" && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Pending Verification</Badge>
                )}
              </div>
            </div>

            <p className="text-4xl font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.serial_id && <div className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" /> Serial: {product.serial_id}</div>}
              {product.origin && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {product.origin}</div>}
              {product.age_years && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {product.age_years}+ years old</div>}
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className={product.quantity > 0 ? "text-accent" : "text-destructive"}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
                </span>
              </div>
            </div>

            {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

            <div className="flex gap-3">
              <Button className="flex-1 rounded-full gap-2" onClick={addToCart} disabled={product.quantity === 0}>
                <ShoppingCart className="h-4 w-4" /> {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="outline" className="rounded-full gap-2" onClick={addToWishlist}>
                <Heart className="h-4 w-4" /> Wishlist
              </Button>
            </div>

            {/* Seller Info */}
            {seller && (
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sold by {seller.display_name || "Seller"}</p>
                    <p className="text-xs text-muted-foreground">{seller.city || "Location not specified"}</p>
                  </div>
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => setShowReport(!showReport)}>
              <AlertTriangle className="h-4 w-4" /> Report as Fake
            </Button>

            {showReport && (
              <form onSubmit={submitReport} className="space-y-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <Textarea placeholder="Explain why you think this is fake..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} required />
                <Button type="submit" variant="destructive" size="sm" className="rounded-full">Submit Report</Button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Reviews</h2>

          {user && (
            <form onSubmit={submitReview} className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h3 className="font-semibold">Write a Review</h3>
              <StarRating rating={reviewRating} onChange={setReviewRating} />
              <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              <Button type="submit" className="rounded-full">Submit Review</Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{r.profiles?.display_name || "Anonymous"}</p>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
