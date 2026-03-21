import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Package, X } from "lucide-react";
import { toast } from "sonner";

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", price: "", serial_id: "", origin: "", age_years: "", category_id: "", quantity: "1", image_url: "",
  });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchProducts();
    fetchCategories();
  }, [user]);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*, categories(name)").eq("seller_id", user!.id).order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: publicUrl }));
    setUploading(false);
    toast.success("Image uploaded!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      serial_id: form.serial_id || null,
      origin: form.origin || null,
      age_years: form.age_years ? parseInt(form.age_years) : null,
      category_id: form.category_id || null,
      quantity: parseInt(form.quantity),
      image_url: form.image_url || null,
      seller_id: user!.id,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update");
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("Failed to create listing");
      else toast.success("Listing created!");
    }

    resetForm();
    fetchProducts();
  }

  function startEdit(product: any) {
    setEditing(product);
    setForm({
      name: product.name, description: product.description || "", price: String(product.price),
      serial_id: product.serial_id || "", origin: product.origin || "", age_years: product.age_years ? String(product.age_years) : "",
      category_id: product.category_id || "", quantity: String(product.quantity), image_url: product.image_url || "",
    });
    setShowForm(true);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Listing deleted");
    fetchProducts();
  }

  function resetForm() {
    setForm({ name: "", description: "", price: "", serial_id: "", origin: "", age_years: "", category_id: "", quantity: "1", image_url: "" });
    setEditing(null);
    setShowForm(false);
  }

  if (loading) return <Layout><div className="max-w-6xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Button className="rounded-full gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-card border border-border space-y-4 animate-slide-down">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Edit Listing" : "New Listing"}</h2>
              <Button type="button" variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Price (₹) *</label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Category</label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Quantity</label>
                <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Serial ID</label>
                <Input value={form.serial_id} onChange={(e) => setForm({ ...form, serial_id: e.target.value })} className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Origin</label>
                <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="e.g. India" className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Age (years)</label>
                <Input type="number" min="0" value={form.age_years} onChange={(e) => setForm({ ...form, age_years: e.target.value })} className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="rounded-lg" />
                {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            {form.image_url && <img src={form.image_url} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />}
            <Button type="submit" className="rounded-full">{editing ? "Update" : "Create"} Listing</Button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">No listings yet. Start selling!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl bg-card border border-border overflow-hidden">
                <img src={p.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80"} alt={p.name} className="w-full aspect-[4/3] object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                    <Badge variant={p.verification_status === "verified" ? "default" : "outline"} className="shrink-0 text-xs">
                      {p.verification_status}
                    </Badge>
                  </div>
                  <p className="text-primary font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {p.quantity} • {p.categories?.name || "Uncategorized"}
                  </p>
                  {p.quantity === 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="rounded-full gap-1 flex-1" onClick={() => startEdit(p)}>
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteProduct(p.id)}>
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
