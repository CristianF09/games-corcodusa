import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCurrentUser, logout } from "@/lib/auth";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isSignedIn, user } = useCurrentUser();

  async function handleLogout() {
    await logout();
    queryClient.clear();
    setLocation("/");
  }

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
          <img src="/Corcodusa3D-Photoroom.png" alt="Corcodușa" className="h-14 w-auto object-contain" />
          <img src="/icon.games.corcodusa.ro.png" alt="games.corcodusa.ro" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLink("/", "Acasă")}
          {navLink("/games", "Jocuri")}
          {navLink("/pricing", "Abonamente")}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
                {user?.firstName ? `Salut, ${user.firstName}` : "Contul meu"}
              </Link>
              <Button variant="ghost" size="default" onClick={handleLogout}>Ieșire</Button>
            </>
          ) : (
            <>
              <Link href="/autentificare">
                <Button variant="ghost" size="default">Autentificare</Button>
              </Link>
              <Link href="/cont-nou">
                <Button size="default">Încearcă gratuit</Button>
              </Link>
            </>
          )}
          {/* Mobile fallback — games shortcut */}
          <Link href="/games" className="md:hidden text-sm font-semibold px-4 py-2 rounded-lg bg-primary/10 text-primary">
            🎮 Jocuri
          </Link>
        </div>
      </div>
    </nav>
  );
}
