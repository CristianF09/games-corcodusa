import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthError, getNextPath } from "@/components/auth/auth-shell";
import { AUTH_ME_KEY, register } from "@/lib/auth";

export default function ContNou() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Parola trebuie să aibă minimum 8 caractere.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({ name, email, password, confirmPassword });
      queryClient.setQueryData(AUTH_ME_KEY, user);
      setLocation(getNextPath("/games"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut crea contul. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Creează-ți contul"
      subtitle="Ai 7 zile gratuite să joci, fără card bancar"
      footer={
        <>
          <p>
            Ai deja cont?{" "}
            <Link href="/autentificare" className="font-semibold text-[#FF6B00] hover:underline">
              Intră în cont
            </Link>
          </p>
          <p className="text-xs text-[#6B7280]">
            Creând un cont ești de acord cu{" "}
            <Link href="/termeni-si-conditii" className="underline">termenii și condițiile</Link> și cu{" "}
            <Link href="/politica-de-confidentialitate" className="underline">politica de confidențialitate</Link>.
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthError message={error} />

        <div className="space-y-2">
          <Label htmlFor="name">Numele tău</Label>
          <Input id="name" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-xs text-[#6B7280]">Opțional — îl folosim doar ca să ne adresăm pe nume.</p>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-[#6B7280]">Minimum 8 caractere.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmă parola</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
          {submitting ? "Se creează contul..." : "Creează contul"}
        </Button>
      </form>
    </AuthShell>
  );
}
