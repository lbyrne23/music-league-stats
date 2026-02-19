import { useState } from "react";
import { Disc3, Users, Music, TrendingUp, Search, Play, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  getArtistStats, 
  getAlbumStats, 
  getSubmitterProfiles, 
  getTopTracks, 
  getGenreStats,
  getMusicStats 
} from "@/lib/musicAnalytics";
import { getGenreColor } from "@/lib/genreMapping";

const MusicExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  const artistStats = getArtistStats();
  const albumStats = getAlbumStats();
  const profiles = getSubmitterProfiles();
  const topTracks = getTopTracks(50);
  const genreStats = getGenreStats();
  const musicStats = getMusicStats();
  
  const filteredArtists = artistStats.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAlbums = albumStats.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredTracks = topTracks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artists.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.submitterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="gradient-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Disc3 className="w-6 h-6 text-primary animate-spin-slow" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Music Explorer</h2>
              <p className="text-xs text-muted-foreground">
                {musicStats.uniqueArtists} artists • {musicStats.uniqueAlbums} albums • {musicStats.uniqueGenres} genres
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search music..." 
              className="pl-9 bg-muted/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <div className="px-5 pt-4 border-b border-border/30">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="profiles" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Taste Profiles
            </TabsTrigger>
            <TabsTrigger value="tracks" className="gap-2">
              <Play className="w-4 h-4" />
              Top Tracks
            </TabsTrigger>
            <TabsTrigger value="artists" className="gap-2">
              <Users className="w-4 h-4" />
              Artists
            </TabsTrigger>
            <TabsTrigger value="genres" className="gap-2">
              <Disc3 className="w-4 h-4" />
              Genres
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Taste Profiles Tab */}
        <TabsContent value="profiles" className="p-5">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {profiles.map((profile, index) => (
              <div 
                key={profile.competitorId}
                className="p-5 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-2xl">
                    {profile.personalityEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{profile.competitorName}</p>
                    <p className="text-xs text-primary font-medium">{profile.personality}</p>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                  <span>{profile.submissionCount} tracks</span>
                  <span>•</span>
                  <span>{profile.uniqueArtists} artists</span>
                </div>

                {/* Genre Breakdown */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Submits</p>
                  <div className="space-y-1.5">
                    {profile.genreBreakdown.slice(0, 4).map(({ genre, percentage }) => (
                      <div key={genre} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-foreground">{genre}</span>
                            <span className="text-muted-foreground">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voting Preferences */}
                {profile.votingGenrePreference.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Upvotes</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.votingGenrePreference.slice(0, 4).map(({ genre, pointsGiven }) => (
                        <span 
                          key={genre}
                          className={`text-xs px-2 py-1 rounded-full border ${getGenreColor(genre)}`}
                        >
                          {genre}
                          <span className="ml-1 opacity-70">+{pointsGiven}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Top Tracks Tab */}
        <TabsContent value="tracks" className="p-5 space-y-4">
          <div className="grid gap-3">
            {filteredTracks.slice(0, 20).map((track, index) => (
              <div 
                key={`${track.spotifyUri}_${track.roundId}`}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => setSelectedTrack(
                  selectedTrack === track.spotifyEmbedUrl ? null : track.spotifyEmbedUrl
                )}
              >
                <span className={`w-6 text-center font-mono text-sm ${
                  index === 0 ? 'text-gold font-bold' : 
                  index === 1 ? 'text-silver' : 
                  index === 2 ? 'text-bronze' : 
                  'text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artists}</p>
                </div>
                
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">by</p>
                  <p className="text-sm font-medium text-foreground truncate max-w-[100px]">
                    {track.submitterName}
                  </p>
                </div>
                
                <div className="text-right min-w-[50px]">
                  <p className={`font-mono font-bold ${index < 3 ? 'text-primary' : 'text-foreground'}`}>
                    {track.points}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
          
          {selectedTrack && (
            <div className="mt-4 rounded-xl overflow-hidden animate-fade-in">
              <iframe
                src={selectedTrack}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          )}
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredArtists.slice(0, 30).map((artist, index) => (
              <div 
                key={artist.name}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{artist.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {artist.submissionCount} submission{artist.submissionCount > 1 ? 's' : ''} • {artist.totalPoints} pts
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-gold' : 
                    index === 1 ? 'text-silver' : 
                    index === 2 ? 'text-bronze' : 
                    'text-primary'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {artist.genres.slice(0, 2).map(genre => (
                    <span 
                      key={genre}
                      className={`text-xs px-2 py-0.5 rounded-full border ${getGenreColor(genre)}`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                {/* Submitters */}
                <div className="flex flex-wrap gap-1">
                  {artist.submitters.slice(0, 3).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {s}
                    </span>
                  ))}
                  {artist.submitters.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{artist.submitters.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Genres Tab */}
        <TabsContent value="genres" className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {genreStats.slice(0, 18).map((genre, index) => (
              <div 
                key={genre.genre}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] animate-fade-in ${getGenreColor(genre.genre)}`}
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{genre.genre}</h3>
                  <span className="text-2xl font-bold opacity-50">#{index + 1}</span>
                </div>
                
                <div className="flex gap-4 text-sm mb-3">
                  <div>
                    <p className="text-xs opacity-70">Submissions</p>
                    <p className="font-mono font-semibold">{genre.submissionCount}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Total Points</p>
                    <p className="font-mono font-semibold">{genre.totalPoints}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs opacity-70 mb-1">Top Artists</p>
                  <p className="text-sm truncate">{genre.topArtists.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MusicExplorer;
