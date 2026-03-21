import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  async function fetchOrder() {
    const { data } = await supabase.from("orders").select("*").eq("id", id).single();
    setOrder(data);
    const { data: oi } = await supabase.from("order_items").select("*, products(name)").eq("order_id", id!);
    setItems(oi || []);
  }

  if (!order) return <Layout><div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in space-y-8">
        <CheckCircle className="h-20 w-20 text-accent mx-auto" />
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your purchase. Your order has been placed successfully.</p>

        <div className="p-6 rounded-xl bg-card border border-border text-left space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Order ID</span><p className="font-mono font-medium">{order.id.slice(0, 8)}</p></div>
            <div><span className="text-muted-foreground">Tracking</span><p className="font-mono font-medium">{order.tracking_number}</p></div>
            <div><span className="text-muted-foreground">Payment</span><p className="capitalize font-medium">{order.payment_method}</p></div>
            <div><span className="text-muted-foreground">Status</span><p className="capitalize font-medium">{order.status}</p></div>
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-2">Items</h3>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm py-1">
                <span>{i.products?.name} × {i.quantity}</span>
                <span>₹{(i.price_at_purchase * i.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button asChild className="rounded-full"><Link to="/orders">View Orders</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link to="/">Continue Shopping</Link></Button>
        </div>
      </div>
    </Layout>
  );
}
