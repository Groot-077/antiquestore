import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchCart();
  }, [user]);

  async function fetchCart() {
    const { data } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user!.id);
    setItems(data || []);
    setLoading(false);
  }

  async function updateQty(itemId: string, qty: number) {
    if (qty < 1) return removeItem(itemId);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
    fetchCart();
  }

  async function removeItem(itemId: string) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    toast.success("Removed from cart");
    fetchCart();
  }

  const total = items.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">Your cart is empty</p>
            <Button asChild className="rounded-full"><Link to="/">Browse Antiques</Link></Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                  <Link to={`/product/${item.product_id}`} className="shrink-0">
                    <img src={item.products?.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=80"} alt={item.products?.name} className="w-24 h-24 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">{item.products?.name}</Link>
                    <p className="text-primary font-bold mt-1">₹{item.products?.price.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full rounded-full" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
