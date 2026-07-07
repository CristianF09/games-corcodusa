import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api-base";
import { CheckCircle2, Mail } from "lucide-react";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = "idle" | "submitting" | "waking" | "success" | "error";

/** Retry once on 502/503 (Render cold-start) with a short delay. */
async function fetchWithWakeUp(url: string, opts: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(15_000) });
  if (res.status === 502 || res.status === 503) {
    // Server was sleeping — wait for it to boot, then retry once
    await new Promise((r) => setTimeout(r, 6_000));
    return fetch(url, { ...opts, signal: AbortSignal.timeout(20_000) });
  }
  return res;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function resetAndClose() {
    setName("");
    setEmail("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const opts: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      };
      // First attempt — if 502 (server sleeping), switch to "waking" state and retry
      const firstRes = await fetch(`${API_BASE_URL}/api/contact`, {
        ...opts,
        signal: AbortSignal.timeout(15_000),
      });
      let res = firstRes;
      if (firstRes.status === 502 || firstRes.status === 503) {
        setStatus("waking");
        await new Promise((r) => setTimeout(r, 6_000));
        res = await fetch(`${API_BASE_URL}/api/contact`, {
          ...opts,
          signal: AbortSignal.timeout(20_000),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "A apărut o eroare. Încearcă din nou.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "A apărut o eroare. Încearcă din nou.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#22C55E] mx-auto mb-4" />
            <DialogTitle className="text-xl font-black text-[#1F2937] mb-2">Mesaj trimis!</DialogTitle>
            <DialogDescription>
              Îți răspundem cât mai rapid la {email}.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black text-[#1F2937]">
                <Mail className="h-5 w-5 text-[#FF6B00]" />
                Contactează-ne
              </DialogTitle>
              <DialogDescription>
                Trimite-ne un mesaj și îți răspundem la contact@corcodusa.ro.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Nume</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Numele tău"
                  required
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@exemplu.ro"
                  required
                  maxLength={320}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Mesaj</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cu ce te putem ajuta?"
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={4}
                />
              </div>

              {status === "error" && (
                <p className="text-sm font-semibold text-[#EF4444]">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting" || status === "waking"}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-base shadow-[0px_6px_20px_rgba(255,107,0,.35)] hover:shadow-[0px_10px_28px_rgba(255,107,0,.50)] hover:from-[#E55A00] hover:to-[#E58A2C] transition-all duration-300 disabled:opacity-60"
              >
                {status === "waking"
                  ? "⏳ Serverul pornește, așteptați..."
                  : status === "submitting"
                  ? "Se trimite..."
                  : "Trimite mesajul"}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
