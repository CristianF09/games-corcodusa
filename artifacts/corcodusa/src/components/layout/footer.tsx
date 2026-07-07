import { useState } from "react";
import { Link } from "wouter";
import { ContactDialog } from "@/components/contact-dialog";

// TODO: înlocuiește cu URL-urile reale ale profilurilor de social media
const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/corcodusa.ro", icon: "/facebook.png" },
  { name: "Instagram", href: "https://www.instagram.com/corcodusa.ro", icon: "/instagram.png" },
  { name: "TikTok", href: "https://www.tiktok.com/@corcodusa.ro", icon: "/tiktok.png" },
  { name: "YouTube", href: "https://www.youtube.com/@corcodusa", icon: null }, // SVG inline (nu există PNG)
];

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden>
      <rect width="40" height="40" rx="8" fill="#FF0000" />
      <path d="M16 13.5v13l11-6.5z" fill="white" />
    </svg>
  );
}

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="w-full bg-[#0A1628] text-white pt-12 pb-8">
      <div className="max-w-[1152px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/Corcodusa3D-Photoroom.png" alt="Corcodușa" className="h-16 w-auto object-contain" />
              <img src="/logo-icon.png" alt="games.corcodusa.ro" className="h-12 w-12 object-contain" />
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Jocuri educaționale sigure pentru copii 3–10 ani. Fără reclame, 100% românesc.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="transition-transform hover:scale-110"
                >
                  {s.icon ? (
                    <img src={s.icon} alt={s.name} className="h-10 w-10 object-contain rounded-lg" />
                  ) : (
                    <YoutubeIcon />
                  )}
                </a>
              ))}
            </div>
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

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} games.corcodusa.ro · Toate drepturile rezervate.</span>
          <span className="flex items-center gap-2">
            Plată securizată prin
            <img src="/stripe.png" alt="Stripe" className="h-6 w-auto object-contain" />
          </span>
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
}
