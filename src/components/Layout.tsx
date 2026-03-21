import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Heart, User, Menu, X, Search, Shield, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    const { error } = await supabase.from("email_subscriptions").insert({ email: subscribeEmail.trim() });
    if (error) {
      if (error.code === "23505") toast.info("You're already subscribed!");
      else toast.error("Failed to subscribe");
    } else {
      toast.success("Subscribed! You'll be notified of new antiques.");
      setSubscribeEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Store className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground tracking-tight">Antique Store</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search antiques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </form>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/wishlist")} className="hover:bg-muted">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="hover:bg-muted">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="hover:bg-muted">
                    <User className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/seller")} className="hover:bg-muted">
                    <Store className="h-5 w-5" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="hover:bg-muted">
                      <Shield className="h-5 w-5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }} className="hover:bg-muted">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")} className="rounded-full">
                  Sign In
                </Button>
              )}
            </nav>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-slide-down">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search antiques..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
                </div>
              </form>
              {user ? (
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }}>
                    <Heart className="h-4 w-4 mr-2" /> Wishlist
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Cart
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate("/seller"); setMobileMenuOpen(false); }}>
                    <Store className="h-4 w-4 mr-2" /> Sell
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}>
                      <Shield className="h-4 w-4 mr-2" /> Admin
                    </Button>
                  )}
                  <Button variant="ghost" className="justify-start" onClick={() => { signOut(); navigate("/"); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              ) : (
                <Button className="w-full rounded-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>Sign In</Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Antique Store</span>
              </div>
              <p className="text-sm text-muted-foreground">Buy, sell, and verify authentic antiques from trusted sellers worldwide.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Browse Antiques</Link></li>
                <li><Link to="/seller" className="hover:text-primary transition-colors">Sell Antiques</Link></li>
                <li><Link to="/orders" className="hover:text-primary transition-colors">Order History</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-3">Get notified when new antiques are listed.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input placeholder="Your email" type="email" value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} className="rounded-full text-sm" required />
                <Button type="submit" size="sm" className="rounded-full shrink-0">Subscribe</Button>
              </form>
            </div>
          </div>
          <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Antique Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
