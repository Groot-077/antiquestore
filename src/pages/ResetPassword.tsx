import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Invalid reset link");
      navigate("/auth");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); navigate("/"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <Store className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Set New Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">New Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="rounded-lg" />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
