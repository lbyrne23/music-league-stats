import { Music2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Disc3, BarChart3, CalendarDays } from "lucide-react";
import StatsCards from "@/components/StatsCards";
import Leaderboard from "@/components/Leaderboard";
import RoundsTable from "@/components/RoundsTable";
import AwardsDashboard from "@/components/AwardsDashboard";
import MusicExplorer from "@/components/MusicExplorer";
import ActivityCalendar from "@/components/ActivityCalendar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-green">
              <Music2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Music League</h1>
              <p className="text-xs text-muted-foreground">Season Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <StatsCards />
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted/30 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="awards" className="gap-2">
              <Trophy className="w-4 h-4" />
              Awards
            </TabsTrigger>
            <TabsTrigger value="music" className="gap-2">
              <Disc3 className="w-4 h-4" />
              Music Explorer
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Leaderboard */}
              <section>
                <Leaderboard />
              </section>

              {/* Rounds */}
              <section>
                <RoundsTable />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="awards">
            <AwardsDashboard />
          </TabsContent>

          <TabsContent value="music">
            <MusicExplorer />
          </TabsContent>

          <TabsContent value="calendar">
            <ActivityCalendar />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Made with 🎵 for the league
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
