import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, originFilter, priceRange, ageFilter, sortBy]);

  useEffect(() => {
    if (user) fetchRecentlyViewed();
  }, [user]);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  }

  async function fetchProducts() {
    let query = supabase.from("products").select("*, categories(name)").eq("is_active", true);

    if (search) query = query.ilike("name", `%${search}%`);
    if (categoryFilter !== "all") query = query.eq("category_id", categoryFilter);
    if (originFilter) query = query.ilike("origin", `%${originFilter}%`);
    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);
    if (ageFilter !== "all") {
      if (ageFilter === "50") query = query.lte("age_years", 50);
      else if (ageFilter === "100") query = query.gte("age_years", 50).lte("age_years", 100);
      else if (ageFilter === "200") query = query.gte("age_years", 100).lte("age_years", 200);
      else if (ageFilter === "200+") query = query.gte("age_years", 200);
    }

    if (sortBy === "newest") query = query.order("created_at", { ascending: false });
    else if (sortBy === "price_low") query = query.order("price", { ascending: true });
    else if (sortBy === "price_high") query = query.order("price", { ascending: false });
    else if (sortBy === "oldest_antique") query = query.order("age_years", { ascending: false });

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }

  async function fetchRecentlyViewed() {
    const { data } = await supabase
      .from("recently_viewed")
      .select("*, products(*, categories(name))")
      .eq("user_id", user!.id)
      .order("viewed_at", { ascending: false })
      .limit(6);
    setRecentlyViewed(data || []);
  }

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setOriginFilter("");
    setPriceRange([0, 1000000]);
    setAgeFilter("all");
    setSortBy("newest");
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Discover Timeless Treasures
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy, sell, and verify authentic antiques from trusted sellers across India and beyond.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="rounded-full text-base px-8" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
                Browse Collection
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              className="rounded-full shrink-0"
              onClick={() => setCategoryFilter("all")}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? "default" : "outline"}
                className="rounded-full shrink-0"
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Filters + Products */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{search ? `Results for "${search}"` : "All Antiques"}</h2>
              <span className="text-sm text-muted-foreground">({products.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" /> Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] rounded-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="oldest_antique">Oldest Antique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 rounded-xl bg-card border border-border space-y-4 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Origin</label>
                  <Input placeholder="e.g. India, China" value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Age</label>
                  <Select value={ageFilter} onValueChange={setAgeFilter}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Age</SelectItem>
                      <SelectItem value="50">Under 50 years</SelectItem>
                      <SelectItem value="100">50–100 years</SelectItem>
                      <SelectItem value="200">100–200 years</SelectItem>
                      <SelectItem value="200+">200+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}</label>
                  <Slider min={0} max={1000000} step={5000} value={priceRange} onValueChange={setPriceRange} className="mt-3" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> Clear filters
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-lg text-muted-foreground">No antiques found</p>
              <Button variant="outline" onClick={clearFilters} className="rounded-full">Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image_url={p.image_url}
                  origin={p.origin}
                  age_years={p.age_years}
                  verification_status={p.verification_status}
                  quantity={p.quantity}
                  category_name={p.categories?.name}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((rv) => rv.products && (
                <ProductCard
                  key={rv.id}
                  id={rv.products.id}
                  name={rv.products.name}
                  price={rv.products.price}
                  image_url={rv.products.image_url}
                  origin={rv.products.origin}
                  age_years={rv.products.age_years}
                  verification_status={rv.products.verification_status}
                  quantity={rv.products.quantity}
                  category_name={rv.products.categories?.name}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
