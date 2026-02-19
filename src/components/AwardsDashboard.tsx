import { Award } from "lucide-react";
import { calculateAwards } from "@/lib/calculateAwards";
import AwardCard from "./AwardCard";

const AwardsDashboard = () => {
  const awards = calculateAwards();

  return (
    <div className="gradient-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-gold" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Season Awards</h2>
            <p className="text-xs text-muted-foreground">Recognition for outstanding achievements</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {awards.map((award, index) => (
            <AwardCard key={award.id} award={award} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardsDashboard;
