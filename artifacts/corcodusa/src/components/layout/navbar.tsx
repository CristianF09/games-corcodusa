import { Link } from "wouter";
import { Show, useClerk, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { signOut } = useClerk();

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-primary/10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 hover:-rotate-2">
          <img src="/logo.svg" alt="Corcodusa Logo" className="h-9 w-9" />
          <span className="font-display text-xl font-bold text-primary">corcodusa</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Always visible */}
          <Link
            href="/games"
            className="text-sm font-bold px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            🎮 Jocuri
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-bold px-4 py-2 rounded-full text-secondary hover:bg-secondary/10 transition-colors hidden md:block"
          >
            Abonamente
          </Link>

          {/* Auth buttons — hidden while auth is disabled for testing */}
          {/*
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" className="font-semibold">Autentificare</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-semibold rounded-full shadow-md">Încearcă gratuit</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Contul meu
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </Show>
          */}
        </div>
      </div>
    </nav>
  );
}
