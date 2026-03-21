import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchWishlist();
  }, [user]);

  async function fetchWishlist() {
    const { data } = await supabase.from("wishlist_items").select("*, products(*, categories(name))").eq("user_id", user!.id).order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function removeItem(itemId: string) {
    await supabase.from("wishlist_items").delete().eq("id", itemId);
    toast.success("Removed from wishlist");
    fetchWishlist();
  }

  async function moveToCart(productId: string, wishlistItemId: string) {
    await supabase.from("cart_items").upsert({ user_id: user!.id, product_id: productId, quantity: 1 }, { onConflict: "user_id,product_id" });
    await supabase.from("wishlist_items").delete().eq("id", wishlistItemId);
    toast.success("Moved to cart!");
    fetchWishlist();
  }

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">Your wishlist is empty</p>
            <Button asChild className="rounded-full"><Link to="/">Browse Antiques</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                <Link to={`/product/${item.product_id}`} className="shrink-0">
                  <img src={item.products?.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=80"} alt={item.products?.name} className="w-24 h-24 rounded-lg object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`} className="font-semibold text-sm hover:text-primary transition-colors">{item.products?.name}</Link>
                  <p className="text-primary font-bold mt-1">₹{item.products?.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{item.products?.categories?.name}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="rounded-full gap-1" onClick={() => moveToCart(item.product_id, item.id)}>
                      <ShoppingCart className="h-3 w-3" /> Add to Cart
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
