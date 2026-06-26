import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export function PrivacyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#1F2937]">
            Politica de Confidențialitate
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-[#4B5563] space-y-3 mt-2">
              <p><strong className="text-[#1F2937]">Date colectate</strong><br />
                Colectăm adresa de email și datele de profil la înregistrare, exclusiv
                pentru gestionarea contului tău.</p>
              <p><strong className="text-[#1F2937]">Plăți</strong><br />
                Plățile sunt procesate securizat prin Stripe. Nu stocăm datele cardului
                bancar pe serverele noastre.</p>
              <p><strong className="text-[#1F2937]">Cookie-uri</strong><br />
                Utilizăm cookie-uri tehnice necesare funcționării platformei și cookie-uri
                de sesiune pentru autentificare. Nu utilizăm cookie-uri de tracking.</p>
              <p><strong className="text-[#1F2937]">Fără reclame</strong><br />
                Nu vindem datele tale și nu afișăm reclame pe platformă.</p>
              <p><strong className="text-[#1F2937]">Drepturi GDPR</strong><br />
                Ai dreptul la acces, rectificare și ștergerea datelor tale.
                Contactează-ne la: contact@corcodusa.ro</p>
              <div className="border-t border-[#E5E7EB] pt-3 text-xs text-[#9CA3AF]">
                Ultima actualizare: Iunie 2026
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
