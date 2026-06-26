import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export function TermsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#1F2937]">
            Termeni și Condiții
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-[#4B5563] space-y-3 mt-2">
              <p><strong className="text-[#1F2937]">1. Acceptarea termenilor</strong><br />
                Prin utilizarea platformei games.corcodusa.ro, acceptați în totalitate
                acești termeni și condiții.</p>
              <p><strong className="text-[#1F2937]">2. Abonamentul</strong><br />
                Serviciul se oferă prin abonament lunar sau anual. Perioada de probă de 7 zile
                este gratuită. Poți anula oricând din contul tău.</p>
              <p><strong className="text-[#1F2937]">3. Utilizare</strong><br />
                Platforma este destinată exclusiv utilizării personale, educaționale.
                Este interzisă reproducerea sau distribuirea conținutului.</p>
              <p><strong className="text-[#1F2937]">4. Conținut</strong><br />
                Toate jocurile, imaginile și materialele sunt proprietatea Corcodușa.ro
                și sunt protejate de dreptul de autor.</p>
              <p><strong className="text-[#1F2937]">5. Contact</strong><br />
                Pentru orice nelămurire: contact@corcodusa.ro</p>
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
