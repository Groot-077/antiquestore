import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
    setProfile(data);
    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
    }).eq("id", user!.id);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password changed!"); setNewPassword(""); setConfirmPassword(""); }
  }

  if (loading) return <Layout><div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
        <h1 className="text-3xl font-bold">Profile</h1>

        <form onSubmit={saveProfile} className="p-6 rounded-xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Display Name</label>
              <Input value={profile?.display_name || ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <Input value={profile?.email || ""} disabled className="rounded-lg bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Phone</label>
              <Input value={profile?.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">City</label>
              <Input value={profile?.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="rounded-lg" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Address</label>
            <Input value={profile?.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="rounded-lg" />
          </div>
          <Button type="submit" className="rounded-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        <form onSubmit={changePassword} className="p-6 rounded-xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required className="rounded-lg" />
            </div>
          </div>
          <Button type="submit" variant="outline" className="rounded-full">Change Password</Button>
        </form>
      </div>
    </Layout>
  );
}
