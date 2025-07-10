export interface LyricLine {
  time: number; // time in milliseconds
  text: string;
}

export interface ParsedLyrics {
  lines: LyricLine[];
  duration: number;
}

export function parseJSONLyrics(jsonData: any[]): ParsedLyrics {
  const lyricLines: LyricLine[] = [];
  
  for (const item of jsonData) {
    if (item.time && item.lyric) {
      // Parse time format "mm:ss.xx"
      const timeMatch = item.time.match(/(\d{2}):(\d{2})\.(\d{2})/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1], 10);
        const seconds = parseInt(timeMatch[2], 10);
        const centiseconds = parseInt(timeMatch[3], 10);
        
        // Convert to milliseconds
        const time = (minutes * 60 * 1000) + (seconds * 1000) + (centiseconds * 10);
        
        // Only add non-empty lyrics
        if (item.lyric.trim()) {
          lyricLines.push({ time, text: item.lyric.trim() });
        }
      }
    }
  }
  
  // Sort by time
  lyricLines.sort((a, b) => a.time - b.time);
  
  // Calculate duration (last lyric time + 5 seconds)
  const duration = lyricLines.length > 0 ? lyricLines[lyricLines.length - 1].time + 5000 : 0;
  
  return { lines: lyricLines, duration };
}

export function getCurrentLyric(lyrics: ParsedLyrics, currentTime: number): {
  current: string;
  next: string;
  progress: number;
} {
  if (!lyrics.lines.length) {
    return { current: '', next: '', progress: 0 };
  }
  
  let currentIndex = -1;
  
  // Find the current lyric
  for (let i = 0; i < lyrics.lines.length; i++) {
    if (currentTime >= lyrics.lines[i].time) {
      currentIndex = i;
    } else {
      break;
    }
  }
  
  const current = currentIndex >= 0 ? lyrics.lines[currentIndex].text : '';
  const next = currentIndex + 1 < lyrics.lines.length ? lyrics.lines[currentIndex + 1].text : '';
  
  // Calculate progress within current lyric
  let progress = 0;
  if (currentIndex >= 0 && currentIndex + 1 < lyrics.lines.length) {
    const currentTimeMs = lyrics.lines[currentIndex].time;
    const nextTimeMs = lyrics.lines[currentIndex + 1].time;
    const timeDiff = nextTimeMs - currentTimeMs;
    const elapsed = currentTime - currentTimeMs;
    progress = timeDiff > 0 ? elapsed / timeDiff : 0;
  }
  
  return { current, next, progress };
}

// JSON file mappings
const JSON_FILES: Record<string, any[]> = {
  'Bruno Mars - Uptown Funk.mp3': require('@/assets/lyrics/Bruno Mars - Uptown Funk.json'),
  'Drake - One Dance.mp3': require('@/assets/lyrics/Drake - One Dance.json'),
  'Ed Sheeran - Perfect.mp3': require('@/assets/lyrics/Ed Sheeran - Perfect.json'),
  'Justin Bieber - Baby.mp3': require('@/assets/lyrics/Justin Bieber - Baby.json'),
  'Mariah Carey  - All I Want for Christmas is You.mp3': require('@/assets/lyrics/Mariah Carey  - All I Want for Christmas is You.json'),
  'Michael Jackson - Billie Jean.mp3': require('@/assets/lyrics/Michael Jackson - Billie Jean.json'),
  'The Weeknd - Die for You.mp3': require('@/assets/lyrics/The Weeknd - Die for You.json'),
  'TRAVIS SCOTT - SICKO MODE (INSTRUMENTAL).mp3': require('@/assets/lyrics/Travis Scott, Drake - Sicko Mode.json'),
};

// Cache for parsed lyrics
const LYRICS_CACHE: Record<string, ParsedLyrics> = {};

export function getLyricsForSong(fileName: string): ParsedLyrics | null {
  // Check cache first
  if (LYRICS_CACHE[fileName]) {
    return LYRICS_CACHE[fileName];
  }

  // Get JSON file
  const jsonFile = JSON_FILES[fileName];
  if (!jsonFile) {
    return null;
  }

  try {
    // Parse the JSON content
    const lyrics = parseJSONLyrics(jsonFile);
    LYRICS_CACHE[fileName] = lyrics;
    return lyrics;
  } catch (error) {
    console.error('Error parsing lyrics for', fileName, error);
    return null;
  }
} 