import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="relative w-full bg-card pt-14 pb-10 md:pt-16 md:pb-12 overflow-hidden">
      {/* Decorative top wave in brand colors */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
      {/* Soft floating shapes for a playful feel */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-44 w-44 rounded-full bg-secondary/10 blur-2xl" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="Corcodusa Logo" className="h-9 w-9 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
              <span className="font-display text-2xl font-bold text-primary">corcodusa</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Jocuri educaționale sigure și captivante pentru copii între 3 și 8 ani.
              Creat cu 💛 pentru părinți și copii din România.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-bold text-secondary">🎮 Platformă</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Acasă</Link>
            <Link href="/games" className="text-sm text-muted-foreground hover:text-primary transition-colors">Jocuri</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Abonamente</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-bold text-accent-foreground">📋 Legal</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termeni și Condiții</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Politica de Confidențialitate</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Corcodușa. Toate drepturile rezervate. 🌈
        </div>
      </div>
    </footer>
  );
}
