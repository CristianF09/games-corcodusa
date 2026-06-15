import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Corcodusa Logo" className="h-8 w-8 grayscale opacity-50" />
              <span className="font-display text-xl font-bold text-foreground">corcodusa</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Jocuri educaționale sigure și captivante pentru copii între 3 și 8 ani.
              Creat cu dragoste pentru părinți și copii din România.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg font-semibold">Platformă</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Acasă</Link>
            <Link href="/games" className="text-sm text-muted-foreground hover:text-primary transition-colors">Jocuri</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Abonamente</Link>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg font-semibold">Legal</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termeni și Condiții</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Politica de Confidențialitate</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Corcodușa. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
