import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchOrders();
  }, [user]);

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function toggleOrder(orderId: string) {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    setExpandedOrder(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*, products(name, image_url)").eq("order_id", orderId);
      setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
    }
  }

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No orders yet</p>
            <Button asChild className="rounded-full"><Link to="/">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl bg-card border border-border overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors" onClick={() => toggleOrder(order.id)}>
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">₹{order.total_amount.toLocaleString("en-IN")}</span>
                    <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                  </div>
                </button>
                {expandedOrder === order.id && (
                  <div className="border-t border-border p-4 space-y-3 animate-slide-down">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Tracking:</span> <span className="font-mono">{order.tracking_number || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Payment:</span> <span className="capitalize">{order.payment_method}</span></div>
                      {order.shipping_address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {order.shipping_address}</div>}
                    </div>
                    {orderItems[order.id]?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <img src={item.products?.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&q=80"} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <span className="flex-1">{item.products?.name}</span>
                        <span className="text-muted-foreground">× {item.quantity}</span>
                        <span className="font-medium">₹{(item.price_at_purchase * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
