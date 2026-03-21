import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchCart();
  }, [user]);

  async function fetchCart() {
    const { data } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user!.id);
    setCartItems(data || []);
    setLoading(false);
    if (!data || data.length === 0) navigate("/cart");
  }

  const total = cartItems.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) { toast.error("Please enter shipping address"); return; }
    setPlacing(true);

    // Create order
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: user!.id,
      total_amount: total,
      payment_method: paymentMethod,
      shipping_address: address,
      tracking_number: `TRK${Date.now().toString(36).toUpperCase()}`,
    }).select().single();

    if (orderError || !order) { toast.error("Failed to place order"); setPlacing(false); return; }

    // Create order items
    const orderItems = cartItems.map((ci) => ({
      order_id: order.id,
      product_id: ci.product_id,
      quantity: ci.quantity,
      price_at_purchase: ci.products?.price || 0,
    }));
    await supabase.from("order_items").insert(orderItems);

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", user!.id);

    toast.success("Order placed successfully!");
    navigate(`/order-confirmation/${order.id}`);
  }

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={placeOrder} className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Shipping */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <Textarea placeholder="Enter your full shipping address..." value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} />
            </div>

            {/* Payment */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <div className="flex gap-3">
                <Button type="button" variant={paymentMethod === "card" ? "default" : "outline"} className="rounded-full flex-1" onClick={() => setPaymentMethod("card")}>
                  Card
                </Button>
                <Button type="button" variant={paymentMethod === "upi" ? "default" : "outline"} className="rounded-full flex-1" onClick={() => setPaymentMethod("upi")}>
                  UPI
                </Button>
              </div>
              {paymentMethod === "card" ? (
                <div className="space-y-3">
                  <Input placeholder="Card Number (simulation)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-lg" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="MM/YY" className="rounded-lg" />
                    <Input placeholder="CVV" className="rounded-lg" />
                  </div>
                </div>
              ) : (
                <Input placeholder="your-id@upi (simulation)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="rounded-lg" />
              )}
              <p className="text-xs text-muted-foreground">* This is a payment simulation — no real charges.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-4 h-fit sticky top-24">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.products?.name} × {item.quantity}</span>
                  <span>₹{((item.products?.price || 0) * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <Button type="submit" className="w-full rounded-full" size="lg" disabled={placing}>
              {placing ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
