// Genre mapping for artists in the music league
// This maps known artists to their primary genres

export const artistGenreMap: Record<string, string[]> = {
  // Indie/Alternative
  "Bon Iver": ["Indie Folk", "Alternative"],
  "Fleet Foxes": ["Indie Folk", "Baroque Pop"],
  "The Strokes": ["Indie Rock", "Garage Rock"],
  "The War On Drugs": ["Indie Rock", "Heartland Rock"],
  "Pit Pony": ["Indie Rock", "Post-Punk"],
  "José González": ["Indie Folk", "Singer-Songwriter"],
  "The National": ["Indie Rock", "Alternative"],
  "Phoebe Bridgers": ["Indie Rock", "Singer-Songwriter"],
  "Ethel Cain": ["Indie", "Slowcore"],
  "CMAT": ["Country", "Indie Pop"],
  "Royel Otis": ["Indie Rock", "Psychedelic"],
  "Fontaines D.C.": ["Post-Punk", "Indie Rock"],
  "Wolf Alice": ["Indie Rock", "Alternative"],
  "NewDad": ["Indie Rock", "Shoegaze"],
  "Lucy Dacus": ["Indie Rock", "Singer-Songwriter"],
  "SPRINTS": ["Post-Punk", "Indie Rock"],
  "Caamp": ["Indie Folk", "Americana"],
  "Colony House": ["Indie Rock", "Alternative"],
  "Cliffords": ["Indie Rock", "Post-Punk"],
  "The Wran": ["Irish Trad", "Folk Punk"],
  "flipturn": ["Indie Rock", "Alternative"],
  "Suki Waterhouse": ["Indie Pop", "Dream Pop"],
  
  // Rock Classics
  "The Clash": ["Punk Rock", "Post-Punk"],
  "Rage Against The Machine": ["Rap Metal", "Alternative Rock"],
  "The Cure": ["Post-Punk", "Gothic Rock"],
  "Fleetwood Mac": ["Rock", "Soft Rock"],
  "Dire Straits": ["Rock", "Blues Rock"],
  "The Cars": ["New Wave", "Power Pop"],
  "Black Sabbath": ["Heavy Metal", "Rock"],
  "Blue Öyster Cult": ["Hard Rock", "Psychedelic Rock"],
  "Supertramp": ["Progressive Rock", "Soft Rock"],
  "Depeche Mode": ["Synth-Pop", "New Wave"],
  "Pink Floyd": ["Progressive Rock", "Psychedelic Rock"],
  "The Beatles": ["Rock", "Pop"],
  "Simon & Garfunkel": ["Folk Rock", "Soft Rock"],
  "Billy Joel": ["Piano Rock", "Pop Rock"],
  "The White Stripes": ["Garage Rock", "Blues Rock"],
  "The Raconteurs": ["Rock", "Blues Rock"],
  "Muse": ["Alternative Rock", "Progressive Rock"],
  "Turnstile": ["Hardcore Punk", "Post-Hardcore"],
  "Pulp": ["Britpop", "Alternative Rock"],
  "Public Service Broadcasting": ["Electronic Rock", "Post-Rock"],
  "Blur": ["Britpop", "Alternative Rock"],
  "Tame Impala": ["Psychedelic Rock", "Indie Rock"],
  "Arcade Fire": ["Indie Rock", "Art Rock"],
  "My Chemical Romance": ["Emo", "Alternative Rock"],
  "The Pretty Reckless": ["Hard Rock", "Alternative Rock"],
  "MGMT": ["Psychedelic Pop", "Indie Rock"],
  "Cocteau Twins": ["Dream Pop", "Shoegaze"],
  "DIIV": ["Shoegaze", "Dream Pop"],
  "Omega": ["Progressive Rock", "Classic Rock"],
  "Geese": ["Art Rock", "Indie Rock"],
  "Deftones": ["Alternative Metal", "Shoegaze"],
  
  // Hip-Hop/Rap
  "Eminem": ["Hip-Hop", "Rap"],
  "Kendrick Lamar": ["Hip-Hop", "Conscious Rap"],
  "JAY-Z": ["Hip-Hop", "Rap"],
  "Nas & Damian \"Jr. Gong\" Marley": ["Hip-Hop", "Reggae"],
  "Doechii": ["Hip-Hop", "Rap"],
  "Kanye West": ["Hip-Hop", "Art Pop"],
  "Tyler, The Creator": ["Hip-Hop", "Alternative Hip-Hop"],
  "OutKast": ["Hip-Hop", "Funk"],
  "Ms. Lauryn Hill": ["R&B", "Hip-Hop"],
  "Madvillain": ["Hip-Hop", "Abstract Hip-Hop"],
  "MF DOOM": ["Hip-Hop", "Abstract Hip-Hop"],
  "Madlib": ["Hip-Hop", "Experimental"],
  "B.o.B": ["Hip-Hop", "Pop Rap"],
  "Childish Gambino": ["Hip-Hop", "R&B"],
  "Wretch 32": ["UK Hip-Hop", "Grime"],
  "Avelino": ["UK Hip-Hop", "Grime"],
  
  // Electronic/Dance
  "Instupendo": ["Electronic", "Ambient"],
  "Nia Archives": ["Jungle", "Drum and Bass"],
  "The Avalanches": ["Plunderphonics", "Electronic"],
  "Hot Chip": ["Electronic", "Synth-Pop"],
  "Daft Punk": ["Electronic", "House"],
  "Aphex Twin": ["IDM", "Electronic"],
  "Bicep": ["Electronic", "House"],
  "PinkPantheress": ["UK Garage", "Dance Pop"],
  "100 gecs": ["Hyperpop", "Electronic"],
  "Laura Les": ["Hyperpop", "Electronic"],
  "Dylan Brady": ["Hyperpop", "Electronic"],
  "Four Tet": ["Electronic", "IDM"],
  "Caribou": ["Electronic", "Psychedelic"],
  "Basshunter": ["Eurodance", "Trance"],
  "Alice Deejay": ["Trance", "Eurodance"],
  "Scooter": ["Happy Hardcore", "Techno"],
  "Special D.": ["Hands Up", "Eurodance"],
  "Parcels": ["Disco", "Synth-Pop"],
  "Touch Sensitive": ["Disco", "Electronic"],
  "SOPHIE": ["Hyperpop", "Electronic"],
  "Two Shell": ["Electronic", "UK Bass"],
  "Ninajirachi": ["Electronic", "Hyperpop"],
  "nimino": ["Electronic", "Deep House"],
  "mischluft": ["Electronic", "House"],
  
  // Pop
  "Taylor Swift": ["Pop", "Country Pop"],
  "Blondie": ["New Wave", "Pop"],
  "Scissor Sisters": ["Pop", "Disco"],
  "Limp Bizkit": ["Nu Metal", "Rap Rock"],
  "Black Eyed Peas": ["Pop", "Hip-Hop"],
  "Disturbed": ["Nu Metal", "Hard Rock"],
  "Lady Gaga": ["Pop", "Dance Pop"],
  "ABBA": ["Pop", "Disco"],
  "Kylie Minogue": ["Pop", "Dance Pop"],
  "Madonna": ["Pop", "Dance"],
  "Robyn": ["Pop", "Electronic"],
  "Britney Spears": ["Pop", "Dance Pop"],
  "Charli xcx": ["Pop", "Hyperpop"],
  "Ashnikko": ["Pop", "Hyperpop"],
  "Ariana Grande": ["Pop", "R&B"],
  "Addison Rae": ["Pop", "Dance Pop"],
  "Kim Petras": ["Pop", "Dance Pop"],
  "Lana Del Rey": ["Dream Pop", "Indie Pop"],
  "Kelis": ["R&B", "Pop"],
  "Whitney Houston": ["Pop", "R&B"],
  "Florence + The Machine": ["Indie Pop", "Art Rock"],
  "Owl City": ["Synth-Pop", "Electronic"],
  "Hellogoodbye": ["Pop Punk", "Synth-Pop"],
  
  // Jazz/Soul/R&B
  "Ella Fitzgerald": ["Jazz", "Vocal Jazz"],
  "Louis Jordan": ["Jump Blues", "Jazz"],
  "Nina Simone": ["Jazz", "Soul"],
  "Sylvester": ["Disco", "Soul"],
  "Funkadelic": ["Funk", "Psychedelic Soul"],
  "Christy Essien Igbokwe": ["Afrobeat", "Funk"],
  "Thundercat": ["Jazz Fusion", "Funk"],
  "Solange": ["R&B", "Neo-Soul"],
  "Bill Withers": ["Soul", "R&B"],
  "The Isley Brothers": ["Soul", "R&B"],
  "Labi Siffre": ["Soul", "Folk"],
  "Breakwater": ["Funk", "Soul"],
  "Rick James": ["Funk", "R&B"],
  "Ronnie Foster": ["Jazz", "Soul Jazz"],
  "Dionne Warwick": ["Soul", "Pop"],
  "Edwin Birdsong": ["Funk", "Disco"],
  "Diana Ross": ["Soul", "Disco"],
  "Joji": ["R&B", "Lo-fi"],
  
  // Reggae/Ska
  "Toots & The Maytals": ["Reggae", "Ska"],
  "Chaka Demus & Pliers": ["Reggae", "Dancehall"],
  "Big Mountain": ["Reggae", "Reggae Pop"],
  "Inner Circle": ["Reggae", "Reggae Pop"],
  "Aswad": ["Reggae", "Dub"],
  "Madness": ["Ska", "New Wave"],
  "KARAMUSHI, SUPER FRIENDS": ["Reggae", "Japanese"],
  "M-Beat, General Levy": ["Jungle", "Ragga"],
  "Cutty Ranks": ["Dancehall", "Reggae"],
  "UB40": ["Reggae", "Pop Reggae"],
  
  // Folk/Singer-Songwriter
  "Joni Mitchell": ["Folk", "Singer-Songwriter"],
  "Johnny Cash": ["Country", "Folk"],
  "Fountains Of Wayne": ["Power Pop", "Pop Rock"],
  "Jesse Sykes & The Sweet Hereafter": ["Alt-Country", "Folk Rock"],
  "Stan Rogers": ["Folk", "Maritime"],
  "Nick Drake": ["Folk", "Singer-Songwriter"],
  "Elliott Smith": ["Indie Folk", "Singer-Songwriter"],
  "Kate Nash": ["Indie Pop", "Singer-Songwriter"],
  "The Chieftains": ["Irish Trad", "Celtic"],
  "Sinéad O'Connor": ["Folk Rock", "Alternative"],
  "Tenacious D": ["Comedy Rock", "Hard Rock"],
  "Leonard Cohen": ["Folk", "Singer-Songwriter"],
  "Hozier": ["Folk Rock", "Soul"],
  "She & Him": ["Indie Pop", "Folk Pop"],
  "The Mary Wallopers": ["Irish Trad", "Folk Punk"],
  "Bog Bodies": ["Irish Trad", "Folk Metal"],
  "Eadaoin": ["Irish Trad", "Folk"],
  "TPM": ["Irish Trad", "Folk Punk"],
  "Headmix Collective": ["Irish Trad", "Electronic"],
  
  // World/International
  "Caetano Veloso": ["MPB", "Tropicália"],
  "Andrés Calamaro": ["Rock en Español", "Rock"],
  "Taeko Onuki": ["City Pop", "Jazz Pop"],
  "Howard Shore": ["Soundtrack", "Orchestral"],
  "Al Massrieen": ["Egyptian Pop", "Funk"],
  "Monomono": ["Afrobeat", "Funk"],
  "Hugh Masekela": ["Jazz", "Afrobeat"],
  "William Onyeabor": ["Synth Funk", "Afrobeat"],
  "Kiki Gyan": ["Disco", "Afrobeat"],
  "Ebo Taylor": ["Highlife", "Afrobeat"],
  "Surchoc": ["Zouglou", "African Pop"],
  "Sauti Sol": ["Afropop", "R&B"],
  "Chicco": ["Bubblegum", "South African"],
  "Fela Kuti": ["Afrobeat", "Jazz Funk"],
  "CKay": ["Afrobeats", "R&B"],
  "Mulatu Astatke": ["Ethio-Jazz", "Jazz"],
  "Molchat Doma": ["Post-Punk", "Synth-Pop"],
  "La Femme": ["French Pop", "Psychedelic"],
  "Kazdoura": ["Arabic Rock", "Alternative"],
  "D.A.N.": ["Electronic", "Indie"],
  "Sigur Rós": ["Post-Rock", "Ambient"],
  "Alisha Chinai": ["Bollywood", "Disco"],
  "Vijay Benedict": ["Bollywood", "Disco"],
  "Nada": ["Italian Pop", "Rock"],
  "Billo's Caracas Boys": ["Tropical", "Latin"],
  "The Coronas": ["Indie Rock", "Irish Rock"],
  "Plastic Bertrand": ["Punk Rock", "New Wave"],
  "Zohra": ["Arabic Pop", "Disco"],
  "Hermanos Gutiérrez": ["Latin", "Instrumental Rock"],
  
  // Misc/Novelty
  "Crystal Swing": ["Country", "Novelty"],
  "William Shatner": ["Spoken Word", "Novelty"],
  "Mrs. Miller": ["Novelty", "Pop"],
  "Mambo Kurt": ["Novelty", "Covers"],
  "Gene Simmons": ["Hard Rock", "Covers"],
  "Zazie's Uh Flower": ["Novelty", "Children's"],
  
  // Post-Punk/New Wave
  "Aphrodite's Child": ["Progressive Rock", "Psychedelic"],
  "Vangelis": ["Electronic", "Soundtrack"],
  "Gabrielle Aplin": ["Folk Pop", "Indie Pop"],
  "The Gene Dudley Group": ["Disco", "Funk"],
  "Headache": ["Indie Rock", "Post-Punk"],
  
  // Modern Pop/Electronic Artists
  "Mitski": ["Indie Rock", "Art Pop"],
  "Dominic Fike": ["Indie Pop", "Alternative"],
  "Alex Cameron": ["Synth-Pop", "Indie Pop"],
  "KAWALA": ["Indie Pop", "Folk Pop"],
  "Maribou State": ["Electronic", "Indie"],
  "Andreya Triana": ["Soul", "Electronic"],
  "Beach House": ["Dream Pop", "Shoegaze"],
  "Boney M.": ["Disco", "Euro Pop"],
  "Maggie Reilly": ["Pop", "New Age"],
  "Derek & The Dominos": ["Blues Rock", "Classic Rock"],
  "Eric Clapton": ["Blues Rock", "Classic Rock"],
  "Ariel Pink": ["Lo-fi", "Psychedelic Pop"],
  "Michael Jackson": ["Pop", "R&B"],
  "Chris Brown": ["R&B", "Pop"],
  "Azealia Banks": ["Hip-Hop", "Electronic"],
  "Thirty Seconds To Mars": ["Alternative Rock", "Electronic Rock"],
  "David Bowie": ["Art Rock", "Glam Rock"],
  "Toni Moralez": ["Electronic", "Dance"],
  "T2": ["UK Garage", "Bassline"],
  "Timbaland": ["Hip-Hop", "R&B"],
  "Keri Hilson": ["R&B", "Pop"],
  "Soulja Boy": ["Hip-Hop", "Crunk"],
  "Kevin Rudolf": ["Pop Rock", "Hip-Hop"],
  "Lil Wayne": ["Hip-Hop", "Rap"],
  "yunè pinku": ["Electronic", "Art Pop"],
  "Cerebella": ["Electronic", "Industrial"],
  "Metronomy": ["Electronic", "Synth-Pop"],
  "Kean Kavanagh": ["Indie", "Irish"],
  "Agnes": ["Pop", "Dance Pop"],
  "Prince": ["Pop", "Funk"],
  "DOPE LEMON": ["Psychedelic Rock", "Indie"],
  "Dead Man's Bones": ["Indie Folk", "Baroque Pop"],
  "Eddie Murphy": ["R&B", "Pop"],
  "Djo": ["Synth-Pop", "Indie Rock"],
  "Jax Jones": ["Dance", "Electronic"],
  "The Blackout Crew": ["Donk", "Happy Hardcore"],
  "DJ Eugene McCauley": ["Donk", "Comedy"],
  "GFOTY": ["Electronic", "Hyperpop"],
  "Getdown Services": ["Punk", "Irish"],
  "Yusuf / Cat Stevens": ["Folk", "Singer-Songwriter"],
};

// Fallback genre detection based on keywords/patterns
export function inferGenreFromArtist(artist: string): string[] {
  const lowerArtist = artist.toLowerCase();
  
  // Check direct mapping first
  if (artistGenreMap[artist]) {
    return artistGenreMap[artist];
  }
  
  // Try partial matches (check if the artist contains a mapped name or vice versa)
  for (const [mappedArtist, genres] of Object.entries(artistGenreMap)) {
    // Check for substring matches (handles "feat." and collaborations)
    if (lowerArtist.includes(mappedArtist.toLowerCase()) || 
        mappedArtist.toLowerCase().includes(lowerArtist)) {
      return genres;
    }
  }
  
  // Check for artist appearing in collaborations (e.g., "Artist1, Artist2")
  const artistParts = artist.split(/[,&]/).map(p => p.trim());
  for (const part of artistParts) {
    if (artistGenreMap[part]) {
      return artistGenreMap[part];
    }
    // Also check partial matches for each part
    for (const [mappedArtist, genres] of Object.entries(artistGenreMap)) {
      if (part.toLowerCase().includes(mappedArtist.toLowerCase()) || 
          mappedArtist.toLowerCase().includes(part.toLowerCase())) {
        return genres;
      }
    }
  }
  
  // Keyword-based inference
  if (lowerArtist.includes("dj") || lowerArtist.includes("remix")) {
    return ["Electronic", "Dance"];
  }
  if (lowerArtist.includes("jazz") || lowerArtist.includes("quartet")) {
    return ["Jazz"];
  }
  if (lowerArtist.includes("orchestra") || lowerArtist.includes("symphony")) {
    return ["Classical", "Orchestral"];
  }
  if (lowerArtist.includes("mc ") || lowerArtist.includes(" mc")) {
    return ["Hip-Hop", "Rap"];
  }
  
  return ["Other"];
}

export const genreColors: Record<string, string> = {
  // Primary genres
  "Indie Rock": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Indie Folk": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Indie Pop": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Indie": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Alternative": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Rock": "bg-red-500/20 text-red-400 border-red-500/30",
  "Hip-Hop": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Rap": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Electronic": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Pop": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Jazz": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Soul": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "R&B": "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  "Reggae": "bg-green-500/20 text-green-400 border-green-500/30",
  "Folk": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Country": "bg-amber-600/20 text-amber-500 border-amber-600/30",
  "Punk Rock": "bg-red-600/20 text-red-500 border-red-600/30",
  "Post-Punk": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "Disco": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Funk": "bg-orange-600/20 text-orange-500 border-orange-600/30",
  "New Wave": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Synth-Pop": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "Heavy Metal": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  "Progressive Rock": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Soundtrack": "bg-stone-500/20 text-stone-400 border-stone-500/30",
  "Dream Pop": "bg-indigo-400/20 text-indigo-300 border-indigo-400/30",
  "Shoegaze": "bg-purple-400/20 text-purple-300 border-purple-400/30",
  "Afrobeat": "bg-yellow-600/20 text-yellow-500 border-yellow-600/30",
  "Irish Trad": "bg-green-600/20 text-green-500 border-green-600/30",
  "UK Garage": "bg-blue-600/20 text-blue-500 border-blue-600/30",
  "Hyperpop": "bg-pink-400/20 text-pink-300 border-pink-400/30",
  "Dance Pop": "bg-pink-600/20 text-pink-500 border-pink-600/30",
  "Britpop": "bg-red-400/20 text-red-300 border-red-400/30",
  "Art Rock": "bg-purple-600/20 text-purple-500 border-purple-600/30",
  "Post-Rock": "bg-slate-400/20 text-slate-300 border-slate-400/30",
  "Other": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function getGenreColor(genre: string): string {
  return genreColors[genre] || genreColors["Other"];
}
