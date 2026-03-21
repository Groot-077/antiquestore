import Layout from "@/components/Layout";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: form,
      });
      if (error) throw error;
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have a question about antiques or need help? We're here to assist you.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h2 className="text-xl font-semibold">Send a Message</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Subject</label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Message</label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>

          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email", line1: "jaipalprakash30102005@gmail.com", line2: "We respond within 24 hours" },
              { icon: MapPin, title: "Location", line1: "Mumbai, Maharashtra", line2: "India" },
              { icon: Phone, title: "Phone", line1: "+91 22 1234 5678", line2: "Mon–Sat, 10am–6pm IST" },
            ].map((c) => (
              <div key={c.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.line1}</p>
                  <p className="text-xs text-muted-foreground">{c.line2}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
