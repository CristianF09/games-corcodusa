import { Link, useLocation } from "wouter";
import { Show, useClerk, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { signOut } = useClerk();
  const [location] = useLocation();

  const navLink = (href: string, label: string) => {
    const isActive = location === href;
    return (
      <Link
        href={href}
        className={[
          "text-base font-medium px-4 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-foreground hover:bg-muted hover:text-primary",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-[0px_10px_15px_-3px_rgba(0,0,0,.07),0px_4px_6px_-4px_rgba(0,0,0,.07)]">
      <div className="max-w-[1152px] mx-auto flex h-20 items-center justify-between px-10">
        {/* Logo + brand name */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="Corcodusa Logo" className="h-11 w-11 object-contain" />
          <span className="text-xl font-black text-[#1F2937] leading-none">
            Corcodușa<span className="text-[#FF6B00]">.ro</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLink("/", "Acasă")}
          {navLink("/games", "Jocuri")}
          {navLink("/pricing", "Abonamente")}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" size="default">Autentificare</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="default">Încearcă gratuit</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
              Contul meu
            </Link>
            <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
          </Show>
          {/* Mobile fallback — games shortcut */}
          <Link href="/games" className="md:hidden text-sm font-semibold px-4 py-2 rounded-lg bg-primary/10 text-primary">
            🎮 Jocuri
          </Link>
        </div>
      </div>
    </nav>
  );
}
