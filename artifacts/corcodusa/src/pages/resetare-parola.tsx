import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthError } from "@/components/auth/auth-shell";
import { requestPasswordReset } from "@/lib/auth";

export default function ResetareParola() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut trimite linkul. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Ți-ai uitat parola?"
      subtitle="Îți trimitem un link ca să alegi una nouă"
      footer={
        <p>
          <Link href="/autentificare" className="font-semibold text-[#FF6B00] hover:underline">
            ← Înapoi la autentificare
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-3 text-sm text-[#374151]">
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700">
            Dacă există un cont cu acest email, ți-am trimis un link de resetare. Verifică și folderul de spam.
          </p>
          <p>Linkul expiră după o oră.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthError message={error} />
          <div className="space-y-2">
            <Label htmlFor="email">Adresă de email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
            {submitting ? "Se trimite..." : "Trimite linkul de resetare"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
