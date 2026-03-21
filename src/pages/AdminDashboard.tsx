import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldX, Clock, Users, Package, AlertTriangle, Tag, Layers } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [verFilter, setVerFilter] = useState("all");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    checkAdmin();
  }, [user]);

  async function checkAdmin() {
    const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (!data) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }
    setIsAdmin(true);
    fetchAll();
  }

  async function fetchAll() {
    const [p, u, o, r, c] = await Promise.all([
      supabase.from("products").select("*, categories(name), profiles!products_seller_id_fkey(display_name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, profiles!orders_user_id_fkey(display_name)").order("created_at", { ascending: false }),
      supabase.from("reports").select("*, products(name), profiles!reports_reporter_id_fkey(display_name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts(p.data || []);
    setUsers(u.data || []);
    setOrders(o.data || []);
    setReports(r.data || []);
    setCategories(c.data || []);
    setLoading(false);
  }

  async function updateVerification(productId: string, status: "pending" | "verified" | "rejected") {
    await supabase.from("products").update({ verification_status: status }).eq("id", productId);
    toast.success(`Product ${status}`);
    fetchAll();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
    toast.success("Order status updated");
    fetchAll();
  }

  async function resolveReport(reportId: string, status: string, notes: string) {
    await supabase.from("reports").update({ status, admin_notes: notes }).eq("id", reportId);
    toast.success("Report updated");
    fetchAll();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    const { error } = await supabase.from("categories").insert(newCategory);
    if (error) toast.error(error.message);
    else { toast.success("Category added"); setNewCategory({ name: "", description: "" }); fetchAll(); }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Category deleted");
    fetchAll();
  }

  if (loading || !isAdmin) return <Layout><div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  const filteredProducts = verFilter === "all" ? products : products.filter((p) => p.verification_status === verFilter);
  const pendingCount = products.filter((p) => p.verification_status === "pending").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Products", value: products.length, icon: Package },
            { label: "Users", value: users.length, icon: Users },
            { label: "Orders", value: orders.length, icon: Layers },
            { label: "Pending Reports", value: pendingReports, icon: AlertTriangle },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border">
              <s.icon className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="antiques">
          <TabsList className="mb-6">
            <TabsTrigger value="antiques" className="gap-1"><ShieldCheck className="h-4 w-4" /> Verify Antiques {pendingCount > 0 && <Badge variant="destructive" className="ml-1 text-xs">{pendingCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1"><Package className="h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="reports" className="gap-1"><AlertTriangle className="h-4 w-4" /> Reports {pendingReports > 0 && <Badge variant="destructive" className="ml-1 text-xs">{pendingReports}</Badge>}</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1"><Tag className="h-4 w-4" /> Categories</TabsTrigger>
          </TabsList>

          {/* Antiques Tab */}
          <TabsContent value="antiques" className="space-y-4">
            <div className="flex gap-2">
              {["all", "pending", "verified", "rejected"].map((f) => (
                <Button key={f} size="sm" variant={verFilter === f ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setVerFilter(f)}>{f}</Button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&q=80"} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Seller: {p.profiles?.display_name} • ₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1 text-accent" onClick={() => updateVerification(p.id, "verified")}><ShieldCheck className="h-3 w-3" /> Verify</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateVerification(p.id, "rejected")}><ShieldX className="h-3 w-3" /> Reject</Button>
                    <Badge variant={p.verification_status === "verified" ? "default" : p.verification_status === "rejected" ? "destructive" : "outline"} className="text-xs">{p.verification_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border text-sm">
                  <div>
                    <p className="font-medium">{u.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                  <div>
                    <p className="font-mono text-sm">#{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{o.profiles?.display_name} • ₹{o.total_amount.toLocaleString("en-IN")}</p>
                  </div>
                  <Select defaultValue={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                    <SelectTrigger className="w-[140px] rounded-full text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Report on: {r.products?.name}</p>
                    <Badge variant={r.status === "pending" ? "outline" : r.status === "resolved" ? "default" : "destructive"} className="text-xs">{r.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">Reporter: {r.profiles?.display_name}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="rounded-full" onClick={() => resolveReport(r.id, "resolved", "Reviewed and resolved")}>Resolve</Button>
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => resolveReport(r.id, "dismissed", "Report dismissed")}>Dismiss</Button>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <p className="text-center text-muted-foreground py-8">No reports</p>}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <form onSubmit={addCategory} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1.5">Category Name</label>
                <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required className="rounded-lg" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1.5">Description</label>
                <Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} className="rounded-lg" />
              </div>
              <Button type="submit" className="rounded-full">Add</Button>
            </form>
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCategory(c.id)}>Delete</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
