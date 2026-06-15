import { Link } from "wouter";
import { Show, useClerk, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { signOut } = useClerk();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <img src="/logo.svg" alt="Corcodusa Logo" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-primary">corcodusa</span>
        </Link>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
              Abonamente
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="font-semibold">Autentificare</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-semibold rounded-full shadow-md">Încearcă gratuit</Button>
            </Link>
          </Show>
          
          <Show when="signed-in">
            <Link href="/games" className="text-sm font-medium hover:text-primary transition-colors">
              Jocuri
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Contul meu
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </Show>
        </div>
      </div>
    </nav>
  );
}
