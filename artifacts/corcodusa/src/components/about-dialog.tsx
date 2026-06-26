import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#1F2937] flex items-center gap-2">
            🍏 Despre Corcodușa
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-[#4B5563] space-y-3 mt-2">
              <p>
                <strong className="text-[#1F2937]">games.corcodusa.ro</strong> este o platformă
                educațională românească dedicată copiilor cu vârste între 3 și 8 ani.
              </p>
              <p>
                Jocurile noastre sunt create împreună cu pedagogi și psihologi pentru a face
                învățarea o aventură plăcută — matematică, alfabet, forme, culori, muzică
                și multe altele.
              </p>
              <p>
                Misiunea noastră: fiecare copil din România să aibă acces la conținut
                educațional de calitate, sigur și fără reclame.
              </p>
              <div className="border-t border-[#E5E7EB] pt-3 text-xs text-[#9CA3AF]">
                Corcodușa.ro · București, România · contact@corcodusa.ro
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
