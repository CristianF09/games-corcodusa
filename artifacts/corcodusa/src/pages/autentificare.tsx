import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthError, getNextPath } from "@/components/auth/auth-shell";
import { AUTH_ME_KEY, login } from "@/lib/auth";

export default function Autentificare() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      queryClient.setQueryData(AUTH_ME_KEY, user);
      setLocation(getNextPath("/dashboard"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut intra în cont. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Bine ai revenit"
      subtitle="Intră în cont ca să-ți vezi jocurile și abonamentul"
      footer={
        <>
          <p>
            Nu ai cont?{" "}
            <Link href="/cont-nou" className="font-semibold text-[#FF6B00] hover:underline">
              Creează unul
            </Link>
          </p>
        </>
      }
    >
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Parolă</Label>
            <Link href="/resetare-parola" className="text-sm font-medium text-[#FF6B00] hover:underline">
              Ai uitat parola?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
          {submitting ? "Se verifică..." : "Intră în cont"}
        </Button>
      </form>
    </AuthShell>
  );
}
