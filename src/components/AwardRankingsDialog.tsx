import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, AwardRanking } from "@/lib/calculateAwards";
import { Crown, Medal, Trophy } from "lucide-react";

interface AwardRankingsDialogProps {
  award: Award | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AwardRankingsDialog = ({ award, open, onOpenChange }: AwardRankingsDialogProps) => {
  if (!award) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-gold" />;
      case 2:
        return <Medal className="w-4 h-4 text-silver" />;
      case 3:
        return <Medal className="w-4 h-4 text-bronze" />;
      default:
        return <span className="text-xs text-muted-foreground font-mono w-4 text-center">{rank}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {award.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{award.description}</p>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">{award.metricLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {award.rankings.map((ranking, index) => (
                <TableRow key={ranking.competitor.id}>
                  <TableCell className="py-2">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                  </TableCell>
                  <TableCell className={`py-2 font-medium ${index === 0 ? 'text-gold' : ''}`}>
                    {ranking.competitor.name}
                  </TableCell>
                  <TableCell className="py-2 text-right font-mono text-sm">
                    {ranking.formattedValue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AwardRankingsDialog;
