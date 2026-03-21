import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isForgot) {
      const { error } = await resetPassword(email);
      if (error) toast.error(error.message);
      else toast.success("Password reset email sent! Check your inbox.");
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else { toast.success("Welcome back!"); navigate("/"); }
    } else {
      if (!displayName.trim()) { toast.error("Please enter your name"); setLoading(false); return; }
      const { error } = await signUp(email, password, displayName);
      if (error) toast.error(error.message);
      else toast.success("Account created! Check your email to verify.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Antique Store</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6">
            {isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isForgot ? "Enter your email to receive a reset link" : isLogin ? "Sign in to continue shopping" : "Join the antique marketplace"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgot && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required className="rounded-lg" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="rounded-lg" />
          </div>
          {!isForgot && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="rounded-lg" />
            </div>
          )}
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Please wait..." : isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center space-y-2 text-sm">
          {isForgot ? (
            <button className="text-primary hover:underline" onClick={() => setIsForgot(false)}>Back to login</button>
          ) : (
            <>
              {isLogin && (
                <button className="text-muted-foreground hover:text-primary transition-colors block mx-auto" onClick={() => setIsForgot(true)}>Forgot password?</button>
              )}
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button className="text-primary font-medium hover:underline" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
