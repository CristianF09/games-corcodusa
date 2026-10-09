import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthError } from "@/components/auth/auth-shell";
import { AUTH_ME_KEY, resetPassword } from "@/lib/auth";

export default function ResetareParolaNoua() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
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
      const user = await resetPassword({ token, password, confirmPassword });
      queryClient.setQueryData(AUTH_ME_KEY, user);
      setLocation("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut schimba parola. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Parolă nouă"
      subtitle="Alege o parolă nouă pentru contul tău"
      footer={
        <p>
          <Link href="/resetare-parola" className="font-semibold text-[#FF6B00] hover:underline">
            Cere un link nou
          </Link>
        </p>
      }
    >
      {!token ? (
        <AuthError message="Linkul de resetare nu este complet. Deschide linkul din email." />
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthError message={error} />
          <div className="space-y-2">
            <Label htmlFor="password">Parola nouă</Label>
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
            <Label htmlFor="confirmPassword">Confirmă parola nouă</Label>
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
            {submitting ? "Se salvează..." : "Salvează parola"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
