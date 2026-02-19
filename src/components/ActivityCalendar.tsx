import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSubmissions, getVotes, getCompetitors, getRounds } from "@/lib/parseData";
import { format, parseISO, isSameDay } from "date-fns";
import { Music, Vote, CalendarDays } from "lucide-react";

interface DayActivity {
  date: Date;
  submissions: {
    time: Date;
    title: string;
    artists: string;
    submitter: string;
    round: string;
  }[];
  votes: {
    time: Date;
    voter: string;
    points: number;
    round: string;
  }[];
}

export default function ActivityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { activityByDate, activityDates, dateRange } = useMemo(() => {
    const submissions = getSubmissions();
    const votes = getVotes();
    const competitors = getCompetitors();
    const rounds = getRounds();

    const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
    const roundMap = new Map(rounds.map(r => [r.id, r.name]));

    const activityMap = new Map<string, DayActivity>();
    const dates: Date[] = [];

    // Process submissions
    submissions.forEach(sub => {
      if (!sub.created) return;
      const date = parseISO(sub.created);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, { date, submissions: [], votes: [] });
        dates.push(date);
      }

      activityMap.get(dateKey)!.submissions.push({
        time: date,
        title: sub.title,
        artists: sub.artists,
        submitter: competitorMap.get(sub.submitterId) || "Unknown",
        round: roundMap.get(sub.roundId) || "Unknown Round",
      });
    });

    // Sort submissions by time
    activityMap.forEach(activity => {
      activity.submissions.sort((a, b) => a.time.getTime() - b.time.getTime());
    });

    // Process votes
    votes.forEach(vote => {
      if (!vote.created) return;
      const date = parseISO(vote.created);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, { date, submissions: [], votes: [] });
        dates.push(date);
      }

      activityMap.get(dateKey)!.votes.push({
        time: date,
        voter: competitorMap.get(vote.voterId) || "Unknown",
        points: vote.points,
        round: roundMap.get(vote.roundId) || "Unknown Round",
      });
    });

    // Sort votes by time
    activityMap.forEach(activity => {
      activity.votes.sort((a, b) => a.time.getTime() - b.time.getTime());
    });

    // Get date range
    const allDates = Array.from(activityMap.values()).map(a => a.date);
    const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
    const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

    return {
      activityByDate: activityMap,
      activityDates: dates,
      dateRange: { from: minDate, to: maxDate },
    };
  }, []);

  const selectedActivity = useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return activityByDate.get(dateKey) || null;
  }, [selectedDate, activityByDate]);

  // Custom day content to show activity indicators
  const modifiers = useMemo(() => {
    const hasSubmissions: Date[] = [];
    const hasVotes: Date[] = [];
    const hasBoth: Date[] = [];

    activityByDate.forEach((activity) => {
      if (activity.submissions.length > 0 && activity.votes.length > 0) {
        hasBoth.push(activity.date);
      } else if (activity.submissions.length > 0) {
        hasSubmissions.push(activity.date);
      } else if (activity.votes.length > 0) {
        hasVotes.push(activity.date);
      }
    });

    return { hasSubmissions, hasVotes, hasBoth };
  }, [activityByDate]);

  const modifiersStyles = {
    hasSubmissions: {
      backgroundColor: "hsl(var(--primary) / 0.3)",
      borderRadius: "50%",
    },
    hasVotes: {
      backgroundColor: "hsl(var(--secondary) / 0.5)",
      borderRadius: "50%",
    },
    hasBoth: {
      background: "linear-gradient(135deg, hsl(var(--primary) / 0.3) 50%, hsl(var(--secondary) / 0.5) 50%)",
      borderRadius: "50%",
    },
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="w-5 h-5 text-primary" />
            Activity Calendar
          </CardTitle>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary/30" />
              <span>Submissions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-secondary/50" />
              <span>Votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.3) 50%, hsl(var(--secondary) / 0.5) 50%)" }} />
              <span>Both</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={dateRange.from}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="pointer-events-auto"
          />
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-muted-foreground text-sm">
              Click on a highlighted date to see activity details.
            </p>
          ) : !selectedActivity ? (
            <p className="text-muted-foreground text-sm">
              No activity on this date.
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {/* Submissions */}
                {selectedActivity.submissions.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Music className="w-4 h-4 text-primary" />
                      Submissions ({selectedActivity.submissions.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedActivity.submissions.map((sub, i) => (
                        <div key={i} className="p-2 rounded-lg bg-muted/30 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{sub.title}</span>
                            <span className="text-xs text-primary font-mono shrink-0">
                              {format(sub.time, "HH:mm")}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {sub.artists} • by {sub.submitter}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {sub.round}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Votes - deduplicated by voter, showing first vote time */}
                {selectedActivity.votes.length > 0 && (() => {
                  // Group by voter and take their earliest vote time
                  const voterTimes = new Map<string, Date>();
                  selectedActivity.votes.forEach(vote => {
                    const existing = voterTimes.get(vote.voter);
                    if (!existing || vote.time < existing) {
                      voterTimes.set(vote.voter, vote.time);
                    }
                  });
                  const uniqueVoters = Array.from(voterTimes.entries())
                    .sort((a, b) => a[1].getTime() - b[1].getTime());

                  return (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Vote className="w-4 h-4 text-secondary" />
                        Voters ({uniqueVoters.length})
                      </h4>
                      <div className="space-y-1">
                        {uniqueVoters.map(([voter, time], i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                            <span className="text-muted-foreground">{voter}</span>
                            <span className="text-foreground font-mono tabular-nums">{format(time, "HH:mm")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
