import { useState } from "react";
import { Link } from "wouter";
import { ContactDialog } from "@/components/contact-dialog";

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="w-full bg-brand text-brand-foreground pt-14 pb-10 md:pt-16 md:pb-12">
      <div className="max-w-[1152px] mx-auto px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="Corcodusa Logo" className="h-12 w-12 object-contain" />
              <span className="text-2xl font-black text-white leading-none">
                Corcodușa<span className="text-[#FFD700]">.ro</span>
              </span>
            </Link>
            <p className="mt-2 max-w-sm text-sm text-white/70 leading-relaxed">
              Jocuri educaționale sigure și captivante pentru copii între 3 și 8 ani.
              Creat cu dragoste pentru familiile din România.
            </p>
          </div>

          {/* Platform links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Platformă</h3>
            <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">Acasă</Link>
            <Link href="/games" className="text-sm text-white/80 hover:text-white transition-colors">Jocuri</Link>
            <Link href="/pricing" className="text-sm text-white/80 hover:text-white transition-colors">Abonamente</Link>
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Legal</h3>
            <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors">Termeni și Condiții</Link>
            <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors">Confidențialitate</Link>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="text-left text-sm text-white/80 hover:text-white transition-colors"
            >
              Contact
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Corcodușa.ro. Toate drepturile rezervate.
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
}
