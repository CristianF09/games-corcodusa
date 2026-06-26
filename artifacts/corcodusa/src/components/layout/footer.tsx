import { useState } from "react";
import { ContactDialog } from "@/components/contact-dialog";
import { AboutDialog } from "@/components/about-dialog";
import { TermsDialog } from "@/components/terms-dialog";
import { PrivacyDialog } from "@/components/privacy-dialog";

type ModalKey = "contact" | "about" | "terms" | "privacy" | null;

export function Footer() {
  const [modal, setModal] = useState<ModalKey>(null);

  const open = (key: ModalKey) => () => setModal(key);
  const close = () => setModal(null);

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
              Jocuri educaționale sigure pentru copii 3–8 ani. Fără reclame, 100% românesc.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Platformă</h3>
            <button type="button" onClick={open("about")} className="text-left text-sm text-white/70 hover:text-white transition-colors">
              Despre noi
            </button>
            <a href="#games" className="text-sm text-white/70 hover:text-white transition-colors">
              Jocuri
            </a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Abonamente
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Legal & Contact</h3>
            <button type="button" onClick={open("terms")} className="text-left text-sm text-white/70 hover:text-white transition-colors">
              Termeni și Condiții
            </button>
            <button type="button" onClick={open("privacy")} className="text-left text-sm text-white/70 hover:text-white transition-colors">
              Confidențialitate
            </button>
            <button type="button" onClick={open("contact")} className="text-left text-sm text-white/70 hover:text-white transition-colors">
              Contact
            </button>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} games.corcodusa.ro · Toate drepturile rezervate.
        </div>
      </div>

      {/* Modals */}
      <ContactDialog open={modal === "contact"} onOpenChange={(v) => !v && close()} />
      <AboutDialog open={modal === "about"} onOpenChange={(v) => !v && close()} />
      <TermsDialog open={modal === "terms"} onOpenChange={(v) => !v && close()} />
      <PrivacyDialog open={modal === "privacy"} onOpenChange={(v) => !v && close()} />
    </footer>
  );
}
