import { Users, Music2, Vote, Trophy } from "lucide-react";
import { getStats } from "@/lib/parseData";

const StatsCards = () => {
  const stats = getStats();

  const cards = [
    {
      title: "Players",
      value: stats.totalCompetitors,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Rounds",
      value: stats.totalRounds,
      icon: Trophy,
      color: "text-accent",
    },
    {
      title: "Submissions",
      value: stats.totalSubmissions,
      icon: Music2,
      color: "text-spotify",
    },
    {
      title: "Votes Cast",
      value: stats.totalVotes.toLocaleString(),
      icon: Vote,
      color: "text-silver",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="gradient-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            {card.value}
          </p>
          <p className="text-sm text-muted-foreground">{card.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
