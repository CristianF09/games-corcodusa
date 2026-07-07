import { useState } from "react";
import { Link } from "wouter";
import { ContactDialog } from "@/components/contact-dialog";

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="w-full bg-[#0A1628] text-white pt-12 pb-8">
      <div className="max-w-[1152px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo-icon2.png" alt="Corcodușa" className="h-14 w-14 object-contain" />
              <img src="/title.logo.games.corcodusa.ro.png" alt="games.corcodusa.ro" className="h-8 object-contain" />
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Jocuri educaționale sigure pentru copii 3–10 ani. Fără reclame, 100% românesc.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Platformă</h3>
            <Link href="/despre-noi" className="text-sm text-white/70 hover:text-white transition-colors">
              Despre Games Corcodușa
            </Link>
            <a href="#games" className="text-sm text-white/70 hover:text-white transition-colors">
              Jocuri
            </a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Abonamente
            </a>
            <Link href="/faq" className="text-sm text-white/70 hover:text-white transition-colors">
              Întrebări frecvente
            </Link>
            <button type="button" onClick={() => setContactOpen(true)} className="text-left text-sm text-white/70 hover:text-white transition-colors">
              Contact
            </button>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Legal</h3>
            <Link href="/termeni-si-conditii" className="text-sm text-white/70 hover:text-white transition-colors">
              Termeni și Condiții
            </Link>
            <Link href="/politica-de-confidentialitate" className="text-sm text-white/70 hover:text-white transition-colors">
              Politica de Confidențialitate
            </Link>
            <Link href="/politica-cookie" className="text-sm text-white/70 hover:text-white transition-colors">
              Politica Cookie
            </Link>
            <Link href="/metode-de-plata" className="text-sm text-white/70 hover:text-white transition-colors">
              Politica de Plată
            </Link>
            <Link href="/politica-de-retur" className="text-sm text-white/70 hover:text-white transition-colors">
              Politica de Retur și Rambursare
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} games.corcodusa.ro · Toate drepturile rezervate.
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
}
