import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Home,
  Library,
  Search,
  Disc3,
  Users,
  ListMusic,
  HardDrive,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Upload,
  Music,
  Cloud,
  Server,
  Database,
  AlertTriangle,
  CheckCircle2,
  X,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  ListOrdered,
  Sparkles,
  Clock,
  Folder,
  Tag,
  Keyboard,
  RefreshCw,
  ShieldCheck,
  Info,
  Gauge,
  AudioLines,
  Mic2,
  Download,
  FileText,
  RotateCcw,
  Hash,
  Check,
  PenLine,
  Share2,
  Cpu,
  Layers,
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTS, THEME TOKENS & STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PROFILE: 'mycloudsound_profile_v1',
  PLAYLISTS: 'mycloudsound_playlists_v1',
  FAVOURITES: 'mycloudsound_favourites_v1',
  HISTORY: 'mycloudsound_history_v1',
  PLAY_COUNTS: 'mycloudsound_playcounts_v1',
  PLAYER_PREFS: 'mycloudsound_player_prefs_v1',
  TAGS: 'mycloudsound_tags_v1',
  LYRICS: 'mycloudsound_lyrics_v1',
};

const SUGGESTED_TAGS = [
  'Late Night',
  'Focus',
  'Workout',
  'Chill',
  'Road Trip',
  'Instrumental',
  'Acoustic',
  'Favorites',
  'High Energy',
];

const SUPPORTED_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'flac',
  'aac',
  'm4a',
  'ogg',
  'opus',
]);

const SUPPORTED_MIME_PREFIXES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/opus',
  'audio/webm',
];

const STUDIO_THEME = {
  name: 'Power Studio Dark',
  accent: '#E2E8F0',
  accentHover: '#FFFFFF',
  accentMuted: 'rgba(226, 232, 240, 0.10)',
  accentBorder: 'rgba(226, 232, 240, 0.22)',
  badgeBg: 'rgba(226, 232, 240, 0.10)',
  badgeText: '#E2E8F0',
};

const CLOUD_CONNECTORS = [
  {
    id: 'gdrive',
    name: 'Google Drive',
    category: 'Cloud Storage',
    description: 'Stream audio folders directly via Google Drive API v3 with OAuth 2.0 PKCE.',
    protocol: 'OAuth 2.0 + Range Stream',
    icon: Cloud,
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    category: 'Cloud Storage',
    description: 'Index personal OneDrive music libraries through Microsoft Graph API.',
    protocol: 'MS Graph API',
    icon: Cloud,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'Cloud Storage',
    description: 'Authorize read-only folder access for personal Dropbox audio archives.',
    protocol: 'Dropbox OAuth 2.0',
    icon: Cloud,
  },
  {
    id: 's3',
    name: 'S3-Compatible Storage',
    category: 'Personal Cloud',
    description: 'Connect Backblaze B2, Cloudflare R2, MinIO, or AWS S3 with presigned URLs.',
    protocol: 'S3 Presigned Range',
    icon: Database,
  },
  {
    id: 'nas',
    name: 'NAS / WebDAV / Self-Hosted',
    category: 'Personal Infrastructure',
    description: 'Link Synology, TrueNAS, or private WebDAV/Subsonic servers on your network.',
    protocol: 'WebDAV / HTTPS',
    icon: Server,
  },
];

const ID3V1_GENRES = [
  'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge', 'Hip-Hop',
  'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B', 'Rap', 'Reggae',
  'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska', 'Death Metal', 'Pranks',
  'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion',
  'Trance', 'Classical', 'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip',
  'Gospel', 'Noise', 'AlternRock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative',
  'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave',
  'Techno-Industrial', 'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock',
  'Comedy', 'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle',
  'Native American', 'Cabaret', 'New Wave', 'Psychedelic', 'Rave', 'Showtunes',
  'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz', 'Polka', 'Retro',
];

// ============================================================================
// 2. UTILITY HELPERS & PROCEDURAL SVG ARTWORK GENERATOR
// ============================================================================

function formatDuration(seconds) {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatTotalDuration(seconds) {
  if (!seconds || !isFinite(seconds)) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs} hr ${mins} min`;
  if (mins > 0) return `${mins} min ${Math.floor(seconds % 60)} sec`;
  return `${Math.floor(seconds)} sec`;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Generates a high-aesthetic procedural SVG album cover seeded by album & artist.
 * Works 100% offline with zero external dependencies.
 */
function generateArtworkSVG(seedText, subtitle = '') {
  const seed = hashString(seedText || 'Cloud Sound Studio');
  const palettes = [
    ['#1B1F30', '#E5A95E', '#3A2E39', '#F4D5A6'],
    ['#141B2D', '#6366F1', '#1E293B', '#A5B4FC'],
    ['#162229', '#34D399', '#1F2F3A', '#99F6E4'],
    ['#231924', '#F472B6', '#332036', '#FBCFE8'],
    ['#1C2029', '#38BDF8', '#253142', '#BAE6FD'],
    ['#261D19', '#FB923C', '#382720', '#FED7AA'],
    ['#1A1D2B', '#A78BFA', '#292440', '#DDD6FE'],
    ['#18221F', '#FBBF24', '#26332D', '#FDE68A'],
  ];
  const [bg, c1, c2, c3] = palettes[seed % palettes.length];
  const cx1 = 25 + (seed % 50);
  const cy1 = 25 + ((seed >> 4) % 50);
  const r1 = 28 + ((seed >> 8) % 26);
  const cx2 = 100 - cx1;
  const cy2 = 100 - cy1;
  const angle = (seed % 180) - 90;
  const variant = seed % 3;
  const initials = (seedText || 'MC')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  let motif = '';
  if (variant === 0) {
    motif = `
      <circle cx="${cx1}" cy="${cy1}" r="${r1}" fill="${c1}" opacity="0.28"/>
      <circle cx="${cx2}" cy="${cy2}" r="${r1 * 0.72}" fill="${c3}" opacity="0.16"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="${c3}" stroke-width="0.6" opacity="0.35"/>
      <circle cx="50" cy="50" r="21" fill="none" stroke="${c1}" stroke-width="0.8" opacity="0.5"/>
      <circle cx="50" cy="50" r="4" fill="${c1}" opacity="0.9"/>
    `;
  } else if (variant === 1) {
    motif = `
      <g transform="rotate(${angle} 50 50)">
        <rect x="14" y="14" width="72" height="72" rx="18" fill="${c2}" opacity="0.55" stroke="${c1}" stroke-width="0.6"/>
        <rect x="28" y="28" width="44" height="44" rx="12" fill="${c1}" opacity="0.22"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="${c3}" stroke-width="0.5" opacity="0.3"/>
      </g>
      <circle cx="${cx1}" cy="${cy2}" r="18" fill="${c1}" opacity="0.24"/>
    `;
  } else {
    motif = `
      <path d="M 0 ${55 + (seed % 15)} Q 30 ${20 + (seed % 20)} 60 ${50 + (seed % 15)} T 100 ${40 + (seed % 20)} L 100 100 L 0 100 Z" fill="${c1}" opacity="0.22"/>
      <path d="M 0 ${72 + (seed % 10)} Q 40 ${45 + (seed % 15)} 75 ${68} T 100 ${60} L 100 100 L 0 100 Z" fill="${c3}" opacity="0.14"/>
      <circle cx="50" cy="36" r="14" fill="none" stroke="${c1}" stroke-width="0.9" opacity="0.6"/>
    `;
  }

  const safeInitials = initials.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g)"/>
    ${motif}
    <text x="50" y="54" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" letter-spacing="2" fill="${c3}" opacity="0.88">${safeInitials}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ============================================================================
// 2B. SYNCED LYRICS (LRC) PARSER & SERIALIZER
// ============================================================================

function formatLrcTimestamp(seconds) {
  const safe = Math.max(0, isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const hundredths = Math.floor((safe - Math.floor(safe)) * 100);
  return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}]`;
}

/**
 * Parses LRC text supporting [mm:ss.xx], [mm:ss.xxx], multiple timestamps per line,
 * and [offset:ms] metadata. Also gracefully handles plain unsynced lyrics.
 */
function parseLRC(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { lines: [], offsetMs: 0, isSynced: false, rawText: '' };
  }

  const rawLines = rawText.replace(/\r\n/g, '\n').split('\n');
  let offsetMs = 0;
  const syncedLines = [];
  const plainLines = [];
  const timeRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const offsetRegex = /^\[offset:\s*([+-]?\d+)\s*\]$/i;
  const metaRegex = /^\[(ar|ti|al|by|re|ve|length):.*\]$/i;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const offsetMatch = trimmed.match(offsetRegex);
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1], 10) || 0;
      continue;
    }
    if (metaRegex.test(trimmed)) continue;

    timeRegex.lastIndex = 0;
    const timestamps = [];
    let match;
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const fracStr = match[3] || '0';
      const frac =
        fracStr.length === 3
          ? parseInt(fracStr, 10) / 1000
          : fracStr.length === 2
          ? parseInt(fracStr, 10) / 100
          : parseInt(fracStr, 10) / 10;
      timestamps.push(mins * 60 + secs + frac);
    }

    const text = trimmed.replace(timeRegex, '').trim();
    if (timestamps.length > 0) {
      timestamps.forEach((time) => {
        syncedLines.push({ time, text: text || '♪' });
      });
    } else if (text) {
      plainLines.push({ time: null, text });
    }
  }

  if (syncedLines.length > 0) {
    syncedLines.sort((a, b) => a.time - b.time);
    return { lines: syncedLines, offsetMs, isSynced: true, rawText };
  }

  return { lines: plainLines, offsetMs: 0, isSynced: false, rawText };
}

function serializeLRC(lines, offsetSec = 0, meta = {}) {
  const header = [];
  if (meta.title) header.push(`[ti:${meta.title}]`);
  if (meta.artist) header.push(`[ar:${meta.artist}]`);
  if (meta.album) header.push(`[al:${meta.album}]`);
  if (offsetSec && Math.abs(offsetSec) > 0.001) {
    header.push(`[offset:${Math.round(offsetSec * 1000)}]`);
  }

  const body = lines
    .filter((l) => l.text && l.text.trim())
    .map((l) => (l.time !== null && l.time !== undefined ? `${formatLrcTimestamp(l.time)} ${l.text.trim()}` : l.text.trim()));

  return [...header, ...body].join('\n');
}

function getBaseFileName(fileName) {
  return (fileName || '').replace(/\.[^/.]+$/, '').trim().toLowerCase();
}

// ============================================================================
// 3. LIGHTWEIGHT BINARY ID3v2 METADATA & APIC ARTWORK PARSER
// ============================================================================

function decodeTextBytes(bytes, encoding) {
  if (!bytes || bytes.length === 0) return '';
  try {
    if (encoding === 0) {
      // ISO-8859-1
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) break;
        str += String.fromCharCode(bytes[i]);
      }
      return str.trim();
    }
    if (encoding === 1 || encoding === 2) {
      // UTF-16 with BOM or UTF-16BE
      let offset = 0;
      let littleEndian = false;
      if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        littleEndian = true;
        offset = 2;
      } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        littleEndian = false;
        offset = 2;
      }
      const decoder = new TextDecoder(littleEndian ? 'utf-16le' : 'utf-16be');
      return decoder.decode(bytes.subarray(offset)).replace(/\0+$/, '').trim();
    }
    // UTF-8 (encoding === 3)
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes).replace(/\0+$/, '').trim();
  } catch {
    return '';
  }
}

function parseGenreValue(raw) {
  if (!raw) return '';
  const match = raw.match(/^\((\d+)\)(.*)$/);
  if (match) {
    const idx = parseInt(match[1], 10);
    if (match[2] && match[2].trim()) return match[2].trim();
    if (ID3V1_GENRES[idx]) return ID3V1_GENRES[idx];
  }
  const numericOnly = /^\d+$/.test(raw.trim());
  if (numericOnly) {
    const idx = parseInt(raw.trim(), 10);
    if (ID3V1_GENRES[idx]) return ID3V1_GENRES[idx];
  }
  return raw.trim();
}

/**
 * Parses ID3v2.3 / ID3v2.4 headers directly from an ArrayBuffer in the browser.
 * Extracts TIT2 (Title), TPE1 (Artist), TALB (Album), TCON (Genre), TYER/TDRC (Year),
 * APIC (Cover Art), USLT (Unsynced Lyrics), and SYLT (Synced Lyrics).
 */
function parseID3v2(buffer) {
  const result = {
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    artworkUrl: null,
    lyrics: '',
  };

  try {
    if (!buffer || buffer.byteLength < 10) return result;
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Check 'ID3' magic header
    if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
      return result;
    }

    const majorVersion = bytes[3]; // 3 = ID3v2.3, 4 = ID3v2.4
    if (majorVersion < 3 || majorVersion > 4) return result;

    const flags = bytes[5];
    const tagSize =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);

    let offset = 10;
    // Skip extended header if present (bit 6)
    if (flags & 0x40 && offset + 4 <= buffer.byteLength) {
      const extSize =
        majorVersion === 4
          ? ((bytes[offset] & 0x7f) << 21) |
            ((bytes[offset + 1] & 0x7f) << 14) |
            ((bytes[offset + 2] & 0x7f) << 7) |
            (bytes[offset + 3] & 0x7f)
          : view.getUint32(offset, false) + 4;
      offset += extSize;
    }

    const end = Math.min(10 + tagSize, buffer.byteLength);

    while (offset + 10 <= end) {
      // Null padding indicates end of frames
      if (bytes[offset] === 0) break;

      const frameId = String.fromCharCode(
        bytes[offset],
        bytes[offset + 1],
        bytes[offset + 2],
        bytes[offset + 3]
      );

      let frameSize = 0;
      if (majorVersion === 4) {
        frameSize =
          ((bytes[offset + 4] & 0x7f) << 21) |
          ((bytes[offset + 5] & 0x7f) << 14) |
          ((bytes[offset + 6] & 0x7f) << 7) |
          (bytes[offset + 7] & 0x7f);
      } else {
        frameSize = view.getUint32(offset + 4, false);
      }

      if (frameSize <= 0 || offset + 10 + frameSize > end) break;

      const frameDataStart = offset + 10;
      const frameBytes = bytes.subarray(frameDataStart, frameDataStart + frameSize);

      if (frameId === 'TIT2' && frameSize > 1) {
        result.title = decodeTextBytes(frameBytes.subarray(1), frameBytes[0]);
      } else if ((frameId === 'TPE1' || frameId === 'TPE2') && frameSize > 1) {
        if (!result.artist || frameId === 'TPE1') {
          result.artist = decodeTextBytes(frameBytes.subarray(1), frameBytes[0]);
        }
      } else if (frameId === 'TALB' && frameSize > 1) {
        result.album = decodeTextBytes(frameBytes.subarray(1), frameBytes[0]);
      } else if (frameId === 'TCON' && frameSize > 1) {
        result.genre = parseGenreValue(decodeTextBytes(frameBytes.subarray(1), frameBytes[0]));
      } else if ((frameId === 'TYER' || frameId === 'TDRC') && frameSize > 1) {
        const y = decodeTextBytes(frameBytes.subarray(1), frameBytes[0]);
        if (y) result.year = y.slice(0, 4);
      } else if (frameId === 'USLT' && !result.lyrics && frameSize > 5) {
        try {
          const encoding = frameBytes[0];
          // Skip 3-byte language code
          let pos = 4;
          if (encoding === 1 || encoding === 2) {
            while (pos + 1 < frameBytes.length && !(frameBytes[pos] === 0 && frameBytes[pos + 1] === 0)) {
              pos += 2;
            }
            pos += 2;
          } else {
            while (pos < frameBytes.length && frameBytes[pos] !== 0) {
              pos++;
            }
            pos++;
          }
          if (pos < frameBytes.length) {
            const lyricText = decodeTextBytes(frameBytes.subarray(pos), encoding);
            if (lyricText) result.lyrics = lyricText;
          }
        } catch {
          // Ignore malformed USLT frame
        }
      } else if (frameId === 'SYLT' && frameSize > 8) {
        try {
          const encoding = frameBytes[0];
          const timestampFormat = frameBytes[4]; // 2 = milliseconds
          // frameBytes[5] is content type; skip null-terminated content descriptor
          let pos = 6;
          if (encoding === 1 || encoding === 2) {
            while (pos + 1 < frameBytes.length && !(frameBytes[pos] === 0 && frameBytes[pos + 1] === 0)) {
              pos += 2;
            }
            pos += 2;
          } else {
            while (pos < frameBytes.length && frameBytes[pos] !== 0) {
              pos++;
            }
            pos++;
          }

          if (timestampFormat === 2) {
            const syltLines = [];
            while (pos < frameBytes.length) {
              const textStart = pos;
              if (encoding === 1 || encoding === 2) {
                while (pos + 1 < frameBytes.length && !(frameBytes[pos] === 0 && frameBytes[pos + 1] === 0)) {
                  pos += 2;
                }
                const text = decodeTextBytes(frameBytes.subarray(textStart, pos), encoding);
                pos += 2;
                if (pos + 4 <= frameBytes.length) {
                  const ms =
                    ((frameBytes[pos] << 24) >>> 0) |
                    (frameBytes[pos + 1] << 16) |
                    (frameBytes[pos + 2] << 8) |
                    frameBytes[pos + 3];
                  pos += 4;
                  if (text) syltLines.push(`${formatLrcTimestamp(ms / 1000)} ${text}`);
                }
              } else {
                while (pos < frameBytes.length && frameBytes[pos] !== 0) {
                  pos++;
                }
                const text = decodeTextBytes(frameBytes.subarray(textStart, pos), encoding);
                pos += 1;
                if (pos + 4 <= frameBytes.length) {
                  const ms =
                    ((frameBytes[pos] << 24) >>> 0) |
                    (frameBytes[pos + 1] << 16) |
                    (frameBytes[pos + 2] << 8) |
                    frameBytes[pos + 3];
                  pos += 4;
                  if (text) syltLines.push(`${formatLrcTimestamp(ms / 1000)} ${text}`);
                }
              }
            }
            if (syltLines.length > 0) {
              result.lyrics = syltLines.join('\n');
            }
          }
        } catch {
          // Ignore malformed SYLT frame
        }
      } else if (frameId === 'APIC' && !result.artworkUrl && frameSize > 16) {
        try {
          const encoding = frameBytes[0];
          let pos = 1;
          let mime = '';
          while (pos < frameBytes.length && frameBytes[pos] !== 0) {
            mime += String.fromCharCode(frameBytes[pos]);
            pos++;
          }
          pos++; // null terminator after MIME
          pos++; // picture type byte

          // Skip description (terminated by 0x00 or 0x00 0x00 for UTF-16)
          if (encoding === 1 || encoding === 2) {
            while (pos + 1 < frameBytes.length && !(frameBytes[pos] === 0 && frameBytes[pos + 1] === 0)) {
              pos += 2;
            }
            pos += 2;
          } else {
            while (pos < frameBytes.length && frameBytes[pos] !== 0) {
              pos++;
            }
            pos++;
          }

          if (pos < frameBytes.length) {
            const imgBytes = frameBytes.slice(pos);
            if (imgBytes.length > 64) {
              const safeMime = mime.startsWith('image/') ? mime : 'image/jpeg';
              const blob = new Blob([imgBytes], { type: safeMime });
              result.artworkUrl = URL.createObjectURL(blob);
            }
          }
        } catch {
          // Ignore malformed APIC frame
        }
      }

      offset += 10 + frameSize;
    }
  } catch {
    // Gracefully fall back to filename metadata
  }

  return result;
}

/**
 * Fallback parser extracting Title, Artist, Album from filename and relative folder path.
 */
function parseFilenameFallback(fileName, relativePath) {
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
  // Strip leading track numbers like "01 - ", "01. ", "1 "
  const withoutTrackNum = cleanName.replace(/^\d{1,3}[\s.\-_]+/, '').trim() || cleanName;

  let artist = '';
  let title = withoutTrackNum;
  let album = '';

  const dashParts = withoutTrackNum.split(/\s+[-–—]\s+/);
  if (dashParts.length >= 2) {
    artist = dashParts[0].trim();
    title = dashParts.slice(1).join(' - ').trim();
  }

  const folderParts = (relativePath || '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  // Remove filename itself
  if (folderParts.length > 0) folderParts.pop();

  const folderPath = folderParts.length > 0 ? '/' + folderParts.join('/') : '/Local Imports';

  if (folderParts.length >= 2) {
    if (!album) album = folderParts[folderParts.length - 1];
    if (!artist) artist = folderParts[folderParts.length - 2];
  } else if (folderParts.length === 1) {
    if (!album) album = folderParts[0];
  }

  return {
    title: title || cleanName || 'Untitled Track',
    artist: artist || 'Unknown Artist',
    album: album || 'Single / Unsorted',
    folder: folderPath,
  };
}

function getAudioDuration(objectUrl) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    let settled = false;

    const finish = (dur) => {
      if (settled) return;
      settled = true;
      audio.removeAttribute('src');
      audio.load();
      resolve(isFinite(dur) && dur > 0 ? dur : 0);
    };

    const timer = setTimeout(() => finish(0), 3500);

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      finish(audio.duration);
    };
    audio.onerror = () => {
      clearTimeout(timer);
      finish(0);
    };

    audio.src = objectUrl;
  });
}

// ============================================================================
// 4. OPTIONAL DEMO MODE: WEB AUDIO SYNTHESIZED PLAYABLE WAV GENERATOR
// ============================================================================

function encodeWavPCM(leftChannel, rightChannel, sampleRate) {
  const numFrames = leftChannel.length;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));
    view.setInt16(offset, l < 0 ? l * 0x8000 : l * 0x7fff, true);
    view.setInt16(offset + 2, r < 0 ? r * 0x8000 : r * 0x7fff, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generates warm, musical stereo ambient/lo-fi WAV blobs so users can test
 * every player control immediately before importing their own local library.
 */
function synthesizeDemoTrackBlob(preset) {
  const sampleRate = 22050;
  const duration = preset.duration;
  const totalSamples = Math.floor(sampleRate * duration);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const chords = preset.chords; // Array of frequency arrays
  const chordLen = duration / chords.length;
  const arpRate = preset.arpRate || 2;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.min(chords.length - 1, Math.floor(t / chordLen));
    const localT = t - chordIdx * chordLen;
    const chord = chords[chordIdx];

    // Smooth chord envelope
    const attack = Math.min(1, localT / 0.35);
    const release = Math.min(1, (chordLen - localT) / 0.45);
    const env = attack * release;

    // Master fade in/out
    const masterEnv = Math.min(1, t / 0.8) * Math.min(1, (duration - t) / 1.2);

    let sigL = 0;
    let sigR = 0;

    // Warm electric piano / pad voices
    for (let n = 0; n < chord.length; n++) {
      const f = chord[n];
      const detune = (n - 1.5) * 0.45;
      const wL = Math.sin(2 * Math.PI * (f + detune) * t) + 0.25 * Math.sin(4 * Math.PI * f * t);
      const wR = Math.sin(2 * Math.PI * (f - detune) * t) + 0.22 * Math.sin(4 * Math.PI * f * t);
      sigL += (wL * 0.14) * env;
      sigR += (wR * 0.14) * env;
    }

    // Gentle sub bass on root note
    const bassFreq = chord[0] * 0.5;
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.18 * env;
    sigL += bass;
    sigR += bass;

    // Soft rhythmic pluck arpeggio
    const stepPos = (t * arpRate) % 1;
    const stepIdx = Math.floor(t * arpRate) % chord.length;
    const pluckFreq = chord[stepIdx] * 2;
    const pluckEnv = Math.exp(-stepPos * 7.5) * 0.12;
    const pan = stepIdx % 2 === 0 ? 0.7 : 0.3;
    const pluck = Math.sin(2 * Math.PI * pluckFreq * t) * pluckEnv;
    sigL += pluck * pan;
    sigR += pluck * (1 - pan);

    // Subtle stereo chorus shimmer
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.35 * t);
    left[i] = sigL * lfo * masterEnv;
    right[i] = sigR * (1.7 - lfo) * masterEnv;
  }

  return encodeWavPCM(left, right, sampleRate);
}

const DEMO_TRACK_PRESETS = [
  {
    id: 'demo-track-1',
    title: 'Obsidian Horizon',
    artist: 'Kairo Solis',
    album: 'Nocturne Architecture',
    genre: 'Ambient',
    year: '2026',
    duration: 18,
    arpRate: 2.0,
    tags: ['Late Night', 'Focus', 'Ambient', 'Instrumental'],
    lyrics: `[00:00.40] Beneath the skyline carved in stone
[00:03.20] Warm amber signals hum alone
[00:06.10] Across the obsidian horizon line
[00:09.00] Every quiet chord bends space and time
[00:12.00] Hold the stillness in the midnight glow
[00:14.90] Letting every distant echo flow`,
    chords: [
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 392.0],
      [164.81, 196.0, 246.94, 329.63],
    ],
  },
  {
    id: 'demo-track-2',
    title: 'Amber Cassette Drift',
    artist: 'Kairo Solis',
    album: 'Nocturne Architecture',
    genre: 'Lo-Fi',
    year: '2026',
    duration: 16,
    arpRate: 2.5,
    tags: ['Chill', 'Focus', 'Lo-Fi', 'Late Night'],
    lyrics: `[00:00.40] Press play on faded magnetic tape
[00:03.00] Soft static shadows start to take their shape
[00:05.80] Streetlights flicker through the windowpane
[00:08.50] Drifting slowly like a midnight train
[00:11.20] Warm copper notes in a gentle loop
[00:13.60] Until the morning breaks the room`,
    chords: [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [293.66, 349.23, 440.0, 523.25],
      [196.0, 246.94, 329.63, 392.0],
    ],
  },
  {
    id: 'demo-track-3',
    title: 'Glass Rain Over Kyoto',
    artist: 'Mireia Vance',
    album: 'Silent Frequencies',
    genre: 'Electronic',
    year: '2025',
    duration: 20,
    arpRate: 3.0,
    tags: ['Road Trip', 'Focus', 'Electronic', 'Late Night'],
    lyrics: `[00:00.50] Silver droplets on the lantern glass
[00:03.60] Footsteps fading as the evening passed
[00:06.80] Neon ripples on the quiet street
[00:10.00] Soft arpeggios beneath our feet
[00:13.20] Silent frequencies begin to rise
[00:16.50] Painting constellations in the skies`,
    chords: [
      [246.94, 293.66, 369.99, 440.0],
      [196.0, 246.94, 293.66, 369.99],
      [220.0, 277.18, 329.63, 415.3],
      [185.0, 220.0, 277.18, 369.99],
    ],
  },
  {
    id: 'demo-track-4',
    title: 'Midnight Vinyl Echo',
    artist: 'Mireia Vance',
    album: 'Silent Frequencies',
    genre: 'Chillwave',
    year: '2025',
    duration: 17,
    arpRate: 1.8,
    tags: ['Chill', 'Late Night', 'Acoustic', 'Favorites'],
    lyrics: `[00:00.40] Needle settles on the spinning groove
[00:03.20] Velvet frequencies begin to move
[00:06.10] Every crackle tells a story old
[00:09.00] Wrapped in indigo and studio gold
[00:11.80] Spinning circles till the silence calls
[00:14.40] Echoes dancing on the studio walls`,
    chords: [
      [196.0, 246.94, 293.66, 369.99],
      [164.81, 196.0, 246.94, 293.66],
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 440.0],
    ],
  },
  {
    id: 'demo-track-5',
    title: 'Velvet Meridian',
    artist: 'Sora & The Mono Tape',
    album: 'Warm Analogues',
    genre: 'Downtempo',
    year: '2026',
    duration: 19,
    arpRate: 2.2,
    tags: ['Road Trip', 'Chill', 'Instrumental', 'High Energy'],
    lyrics: `[00:00.50] Crossing bridges in the twilight haze
[00:03.50] Counting rhythms in the golden rays
[00:06.60] Analog warmth on a coastal drive
[00:09.70] Every harmonic feels alive
[00:12.80] Following the velvet meridian south
[00:15.90] Where the ocean meets the river mouth`,
    chords: [
      [293.66, 349.23, 440.0, 523.25],
      [233.08, 293.66, 349.23, 440.0],
      [261.63, 329.63, 392.0, 466.16],
      [220.0, 261.63, 329.63, 392.0],
    ],
  },
  {
    id: 'demo-track-6',
    title: 'Solstice Telemetry',
    artist: 'Sora & The Mono Tape',
    album: 'Warm Analogues',
    genre: 'Ambient',
    year: '2026',
    duration: 16,
    arpRate: 1.5,
    tags: ['Focus', 'Ambient', 'Instrumental', 'Workout'],
    lyrics: `[00:00.40] Signals drifting from the northern star
[00:03.00] Clear telemetry from worlds afar
[00:05.70] Steady pulse inside the quiet dark
[00:08.40] Guiding every solitary spark
[00:11.10] Solstice light across the endless sea
[00:13.70] Pure and weightless in harmonic key`,
    chords: [
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 349.23],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 349.23],
    ],
  },
];

// ============================================================================
// 5. LOCALSTORAGE SAFE HELPERS
// ============================================================================

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors gracefully
  }
}

// ============================================================================
// 6. DRAG & DROP RECURSIVE DIRECTORY SCANNER
// ============================================================================

async function collectFilesFromDataTransfer(dataTransfer) {
  const results = [];
  const items = dataTransfer.items ? Array.from(dataTransfer.items) : [];

  const readEntry = (entry, pathPrefix = '') =>
    new Promise((resolve) => {
      if (entry.isFile) {
        entry.file(
          (file) => {
            results.push({
              file,
              relativePath: pathPrefix ? `${pathPrefix}/${file.name}` : file.name,
            });
            resolve();
          },
          () => resolve()
        );
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readAllEntries = () => {
          reader.readEntries(
            async (entries) => {
              if (!entries.length) {
                resolve();
                return;
              }
              for (const child of entries) {
                await readEntry(child, pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name);
              }
              readAllEntries();
            },
            () => resolve()
          );
        };
        readAllEntries();
      } else {
        resolve();
      }
    });

  if (items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await readEntry(entry);
      }
    }
  } else if (dataTransfer.files) {
    for (const file of Array.from(dataTransfer.files)) {
      results.push({ file, relativePath: file.webkitRelativePath || file.name });
    }
  }

  return results;
}

// ============================================================================
// 7. MAIN APPLICATION COMPONENT
// ============================================================================

function CloudSoundStudioApp() {
  // ---- Navigation & UI State ----
  const [activePage, setActivePage] = useState('home');
  const [selectedAlbumKey, setSelectedAlbumKey] = useState(null);
  const [selectedArtistName, setSelectedArtistName] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [libraryTab, setLibraryTab] = useState('songs');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ---- Persistent User Profile & Preferences ----
  const [profile, setProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE, {
      name: 'Personal Studio',
      defaultSpeed: 1,
      gaplessEnabled: true,
    })
  );

  const theme = STUDIO_THEME;

  // ---- Music Library State ----
  const [tracks, setTracks] = useState([]);
  const [sources, setSources] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);
  const [indexingState, setIndexingState] = useState({
    active: false,
    total: 0,
    processed: 0,
    currentFile: '',
  });

  // ---- Persistent User Collections ----
  const [playlists, setPlaylists] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PLAYLISTS, [])
  );
  const [favourites, setFavourites] = useState(() =>
    loadFromStorage(STORAGE_KEYS.FAVOURITES, [])
  );
  const [history, setHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY, [])
  );
  const [playCounts, setPlayCounts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PLAY_COUNTS, {})
  );
  const [trackTagsMap, setTrackTagsMap] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TAGS, {})
  );
  const [trackLyricsMap, setTrackLyricsMap] = useState(() =>
    loadFromStorage(STORAGE_KEYS.LYRICS, {})
  );

  // ---- Search & Library Filter/Sort ----
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('');
  const [librarySort, setLibrarySort] = useState('dateAdded'); // title | artist | album | dateAdded | duration
  const [librarySortDir, setLibrarySortDir] = useState('desc');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // ---- Global Audio Player State ----
  const audioRef = useRef(null);
  const savedPlayerPrefs = useMemo(
    () =>
      loadFromStorage(STORAGE_KEYS.PLAYER_PREFS, {
        volume: 0.85,
        shuffle: false,
        repeat: 'off',
      }),
    []
  );

  const [queue, setQueue] = useState([]); // Array of track IDs
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(savedPlayerPrefs.volume ?? 0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(savedPlayerPrefs.shuffle ?? false);
  const [repeat, setRepeat] = useState(savedPlayerPrefs.repeat ?? 'off'); // 'off' | 'all' | 'one'
  const [playbackRate, setPlaybackRate] = useState(profile.defaultSpeed || 1);
  const [isExpandedPlayer, setIsExpandedPlayer] = useState(false);
  const [expandedRightTab, setExpandedRightTab] = useState('lyrics'); // 'lyrics' | 'queue'
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [audioError, setAudioError] = useState(null);

  // ---- Synced Lyrics Editor & Quick Tag Editor State ----
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [lyricsEditorMode, setLyricsEditorMode] = useState('text'); // 'text' | 'tap'
  const [lyricsDraftText, setLyricsDraftText] = useState('');
  const [tapSyncLines, setTapSyncLines] = useState([]);
  const [tapSyncIndex, setTapSyncIndex] = useState(0);
  const [tagEditorTrackId, setTagEditorTrackId] = useState(null);
  const [tagInputValue, setTagInputValue] = useState('');
  const activeLyricRef = useRef(null);
  const homeLyricsContainerRef = useRef(null);
  const homeActiveLyricRef = useRef(null);
  const lrcInputRef = useRef(null);

  // ---- Modals, Menus & Toasts ----
  const [toasts, setToasts] = useState([]);
  const [playlistModal, setPlaylistModal] = useState({ open: false, mode: 'create', playlistId: null, name: '' });
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [connectorInfoModal, setConnectorInfoModal] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [trackMenuId, setTrackMenuId] = useState(null);

  // ---- File Inputs ----
  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);
  const signatureSetRef = useRef(new Set());
  const objectUrlsRef = useRef(new Set());
  const didBootDemoRef = useRef(false);

  // ---- Persist to localStorage ----
  useEffect(() => saveToStorage(STORAGE_KEYS.PROFILE, profile), [profile]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists), [playlists]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FAVOURITES, favourites), [favourites]);
  useEffect(() => saveToStorage(STORAGE_KEYS.HISTORY, history.slice(0, 120)), [history]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PLAY_COUNTS, playCounts), [playCounts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TAGS, trackTagsMap), [trackTagsMap]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LYRICS, trackLyricsMap), [trackLyricsMap]);
  useEffect(
    () => saveToStorage(STORAGE_KEYS.PLAYER_PREFS, { volume, shuffle, repeat }),
    [volume, shuffle, repeat]
  );

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, []);

  // ---- Toast Helper ----
  const pushToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  // ---- Share Live Portfolio Link (iframe & browser safe) ----
  const handleSharePortfolioLink = useCallback(() => {
    const shareUrl = window.location.href;
    try {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      pushToast('Live portfolio link copied to clipboard.', 'success');
    } catch {
      pushToast('Copy the URL from your browser address bar to share.', 'info');
    }
  }, [pushToast]);

  // ---- Track Lookup Map ----
  const trackMap = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tracks]);

  const currentTrack = currentTrackId ? trackMap.get(currentTrackId) || null : null;

  // ============================================================================
  // 7B. TAGS & SYNCED LYRICS HELPERS
  // ============================================================================

  const getTrackKey = useCallback((track) => track?.signature || track?.id || '', []);

  const getTrackTags = useCallback(
    (track) => {
      if (!track) return [];
      const key = getTrackKey(track);
      if (Array.isArray(trackTagsMap[key])) {
        return trackTagsMap[key];
      }
      return Array.isArray(track.defaultTags) ? track.defaultTags : [];
    },
    [trackTagsMap, getTrackKey]
  );

  const addTagToTrack = useCallback(
    (track, rawTag) => {
      if (!track) return;
      const clean = rawTag.trim().replace(/^#+/, '').slice(0, 28);
      if (!clean) return;
      const key = getTrackKey(track);
      setTrackTagsMap((prev) => {
        const existing = Array.isArray(prev[key])
          ? prev[key]
          : Array.isArray(track.defaultTags)
          ? track.defaultTags
          : [];
        if (existing.some((t) => t.toLowerCase() === clean.toLowerCase())) {
          return prev;
        }
        return { ...prev, [key]: [...existing, clean] };
      });
      pushToast(`Tagged "${track.title}" with #${clean}`, 'success');
    },
    [getTrackKey, pushToast]
  );

  const removeTagFromTrack = useCallback(
    (track, tagToRemove) => {
      if (!track) return;
      const key = getTrackKey(track);
      setTrackTagsMap((prev) => {
        const existing = Array.isArray(prev[key])
          ? prev[key]
          : Array.isArray(track.defaultTags)
          ? track.defaultTags
          : [];
        return {
          ...prev,
          [key]: existing.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()),
        };
      });
    },
    [getTrackKey]
  );

  const getTrackLyricsRecord = useCallback(
    (track) => {
      if (!track) return { rawText: '', offsetSec: 0 };
      const key = getTrackKey(track);
      const saved = trackLyricsMap[key];
      if (saved) {
        return {
          rawText: saved.rawText ?? '',
          offsetSec: typeof saved.offsetSec === 'number' ? saved.offsetSec : 0,
        };
      }
      return {
        rawText: track.defaultLyrics || '',
        offsetSec: 0,
      };
    },
    [trackLyricsMap, getTrackKey]
  );

  const saveTrackLyrics = useCallback(
    (track, rawText, offsetSec = undefined) => {
      if (!track) return;
      const key = getTrackKey(track);
      setTrackLyricsMap((prev) => {
        const prevEntry = prev[key] || { rawText: track.defaultLyrics || '', offsetSec: 0 };
        return {
          ...prev,
          [key]: {
            rawText,
            offsetSec: offsetSec !== undefined ? offsetSec : prevEntry.offsetSec,
          },
        };
      });
    },
    [getTrackKey]
  );

  const adjustLyricsOffset = useCallback(
    (track, deltaSec, reset = false) => {
      if (!track) return;
      const key = getTrackKey(track);
      setTrackLyricsMap((prev) => {
        const prevEntry = prev[key] || { rawText: track.defaultLyrics || '', offsetSec: 0 };
        const nextOffset = reset ? 0 : +(prevEntry.offsetSec + deltaSec).toFixed(2);
        return {
          ...prev,
          [key]: { ...prevEntry, offsetSec: nextOffset },
        };
      });
    },
    [getTrackKey]
  );

  const navigateToTag = useCallback((tag) => {
    setSelectedTag(tag);
    setLibraryTab('tags');
    setActivePage('library');
    setIsExpandedPlayer(false);
  }, []);

  const currentLyricsRecord = useMemo(
    () => getTrackLyricsRecord(currentTrack),
    [currentTrack, getTrackLyricsRecord]
  );

  const currentParsedLyrics = useMemo(
    () => parseLRC(currentLyricsRecord.rawText),
    [currentLyricsRecord.rawText]
  );

  const effectiveLyricsOffsetSec =
    (currentLyricsRecord.offsetSec || 0) + (currentParsedLyrics.offsetMs || 0) / 1000;

  const activeLyricIndex = useMemo(() => {
    if (!currentParsedLyrics.isSynced || currentParsedLyrics.lines.length === 0) return -1;
    const adjustedTime = currentTime + effectiveLyricsOffsetSec;
    let idx = -1;
    for (let i = 0; i < currentParsedLyrics.lines.length; i++) {
      if (currentParsedLyrics.lines[i].time <= adjustedTime + 0.08) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentParsedLyrics, currentTime, effectiveLyricsOffsetSec]);

  // Smooth auto-scroll to keep the active lyric line centered
  useEffect(() => {
    if (
      isExpandedPlayer &&
      expandedRightTab === 'lyrics' &&
      !showLyricsEditor &&
      activeLyricIndex >= 0 &&
      activeLyricRef.current
    ) {
      try {
        activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // Ignore scroll errors
      }
    }
  }, [activeLyricIndex, isExpandedPlayer, expandedRightTab, showLyricsEditor]);

  // Smooth auto-scroll inside the Homepage side-by-side lyrics panel without scrolling the outer page
  useEffect(() => {
    if (
      activePage === 'home' &&
      !isExpandedPlayer &&
      activeLyricIndex >= 0 &&
      homeLyricsContainerRef.current &&
      homeActiveLyricRef.current
    ) {
      const container = homeLyricsContainerRef.current;
      const target = homeActiveLyricRef.current;
      const nextTop =
        target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    }
  }, [activeLyricIndex, activePage, isExpandedPlayer]);

  const handleOpenLyricsEditor = useCallback(() => {
    if (!currentTrack) return;
    const rec = getTrackLyricsRecord(currentTrack);
    setLyricsDraftText(rec.rawText || '');
    const parsed = parseLRC(rec.rawText || '');
    setTapSyncLines(
      parsed.lines.length > 0
        ? parsed.lines.map((l) => ({ text: l.text, time: l.time }))
        : []
    );
    setTapSyncIndex(0);
    setLyricsEditorMode('text');
    setShowLyricsEditor(true);
  }, [currentTrack, getTrackLyricsRecord]);

  const handleSwitchToTapMode = useCallback(() => {
    const rawLines = lyricsDraftText
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim())
      .filter((l) => l && !/^\[(ar|ti|al|by|re|ve|length|offset):.*\]$/i.test(l));
    setTapSyncLines(rawLines.map((text) => ({ text, time: null })));
    setTapSyncIndex(0);
    setLyricsEditorMode('tap');
  }, [lyricsDraftText]);

  const handleStampTapLine = useCallback(() => {
    if (tapSyncIndex >= tapSyncLines.length) return;
    const stampTime = audioRef.current ? audioRef.current.currentTime : currentTime;
    setTapSyncLines((prev) =>
      prev.map((item, idx) => (idx === tapSyncIndex ? { ...item, time: stampTime } : item))
    );
    setTapSyncIndex((i) => Math.min(tapSyncLines.length, i + 1));
  }, [tapSyncIndex, tapSyncLines.length, currentTime]);

  const handleSaveLyricsDraft = useCallback(() => {
    if (!currentTrack) return;
    if (lyricsEditorMode === 'tap') {
      const lrcString = serializeLRC(tapSyncLines, currentLyricsRecord.offsetSec, {
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
      });
      saveTrackLyrics(currentTrack, lrcString);
      setLyricsDraftText(lrcString);
      pushToast(`Saved synced lyrics for "${currentTrack.title}"`, 'success');
    } else {
      saveTrackLyrics(currentTrack, lyricsDraftText);
      pushToast(`Saved lyrics for "${currentTrack.title}"`, 'success');
    }
    setShowLyricsEditor(false);
  }, [
    currentTrack,
    lyricsEditorMode,
    tapSyncLines,
    currentLyricsRecord.offsetSec,
    lyricsDraftText,
    saveTrackLyrics,
    pushToast,
  ]);

  const handleExportLrc = useCallback(() => {
    if (!currentTrack || !currentParsedLyrics.lines.length) {
      pushToast('No lyrics available to export for this track.', 'info');
      return;
    }
    const content = serializeLRC(currentParsedLyrics.lines, currentLyricsRecord.offsetSec, {
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.lrc`.replace(/[\\/:*?"<>|]/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    pushToast('Exported .lrc file', 'success');
  }, [currentTrack, currentParsedLyrics.lines, currentLyricsRecord.offsetSec, pushToast]);

  const handleAttachLrcFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentTrack) return;
    try {
      const text = await file.text();
      saveTrackLyrics(currentTrack, text, 0);
      setLyricsDraftText(text);
      setShowLyricsEditor(false);
      pushToast(`Attached "${file.name}" to "${currentTrack.title}"`, 'success');
    } catch {
      pushToast('Failed to read .lrc file.', 'error');
    }
  };

  // ============================================================================
  // 8. LOCAL FILE & FOLDER INDEXING ENGINE
  // ============================================================================

  const processIncomingFiles = useCallback(
    async (fileEntries, sourceLabel = 'Local Storage') => {
      if (!fileEntries || fileEntries.length === 0) return;

      setIndexingState({
        active: true,
        total: fileEntries.length,
        processed: 0,
        currentFile: fileEntries[0]?.file?.name || '',
      });

      // Pre-scan incoming .lrc files so companion lyrics match automatically by base filename
      const lrcMap = new Map();
      const audioEntries = [];

      for (const entry of fileEntries) {
        const ext = (entry.file.name.split('.').pop() || '').toLowerCase();
        if (ext === 'lrc') {
          try {
            const text = await entry.file.text();
            lrcMap.set(getBaseFileName(entry.file.name), text);
          } catch {
            // Ignore unreadable .lrc file
          }
        } else {
          audioEntries.push(entry);
        }
      }

      const newlyAdded = [];
      const newlyUnsupported = [];
      const matchedLyricsUpdates = {};
      let duplicatesSkipped = 0;
      let matchedLrcCount = 0;

      // Also match incoming .lrc files against already-loaded tracks
      if (lrcMap.size > 0 && tracks.length > 0) {
        tracks.forEach((existingTrack) => {
          const candidates = [
            getBaseFileName(existingTrack.fileName || ''),
            existingTrack.title.toLowerCase(),
            `${existingTrack.artist} - ${existingTrack.title}`.toLowerCase(),
          ];
          for (const c of candidates) {
            if (c && lrcMap.has(c)) {
              matchedLyricsUpdates[getTrackKey(existingTrack)] = {
                rawText: lrcMap.get(c),
                offsetSec: 0,
              };
              matchedLrcCount++;
              break;
            }
          }
        });
      }

      for (let i = 0; i < audioEntries.length; i++) {
        const { file, relativePath } = audioEntries[i];
        setIndexingState({
          active: true,
          total: audioEntries.length,
          processed: i + 1,
          currentFile: file.name,
        });

        // Skip hidden OS metadata files (e.g. .DS_Store, Thumbs.db)
        if (file.name.startsWith('.') || file.name.toLowerCase() === 'thumbs.db') {
          continue;
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isSupported =
          SUPPORTED_EXTENSIONS.has(ext) ||
          SUPPORTED_MIME_PREFIXES.some((prefix) => (file.type || '').toLowerCase().startsWith(prefix));

        if (!isSupported) {
          // Only report non-image/non-text or audio-like unsupported files, or any unrecognized file
          const ignoredNonAudio = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'txt', 'nfo', 'lrc', 'pdf', 'ini', 'json', 'm3u', 'm3u8', 'cue', 'log']);
          if (!ignoredNonAudio.has(ext)) {
            newlyUnsupported.push({
              id: `${file.name}-${file.size}-${Date.now()}`,
              name: file.name,
              ext: ext || 'unknown',
              size: file.size,
              reason: `Format ".${ext || 'unknown'}" is not supported by browser audio decoders. Supported: MP3, WAV, FLAC, AAC, M4A, OGG, OPUS.`,
            });
          }
          continue;
        }

        const signature = `${file.name.toLowerCase()}_${file.size}`;
        if (signatureSetRef.current.has(signature)) {
          duplicatesSkipped++;
          continue;
        }
        signatureSetRef.current.add(signature);

        const objectUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(objectUrl);

        // Extract ID3v2 tags (including USLT/SYLT lyrics) for MP3/audio files
        let id3 = { title: '', artist: '', album: '', genre: '', year: '', artworkUrl: null, lyrics: '' };
        if (ext === 'mp3' || file.type === 'audio/mpeg') {
          try {
            const sliceSize = Math.min(file.size, 2 * 1024 * 1024);
            const buffer = await file.slice(0, sliceSize).arrayBuffer();
            id3 = parseID3v2(buffer);
            if (id3.artworkUrl) {
              objectUrlsRef.current.add(id3.artworkUrl);
            }
          } catch {
            // Fallback gracefully
          }
        }

        const fallback = parseFilenameFallback(file.name, relativePath);
        const realDuration = await getAudioDuration(objectUrl);

        const title = id3.title || fallback.title;
        const artist = id3.artist || fallback.artist;
        const album = id3.album || fallback.album;
        const genre = id3.genre || 'Uncategorized';
        const year = id3.year || '';
        const artwork = id3.artworkUrl || generateArtworkSVG(`${album} ${artist}`, title);

        const baseName = getBaseFileName(file.name);
        const companionLrc = lrcMap.get(baseName) || '';
        const resolvedLyrics = companionLrc || id3.lyrics || '';
        if (companionLrc) matchedLrcCount++;

        const defaultTags = [];
        if (genre && genre !== 'Uncategorized') defaultTags.push(genre);
        if (year) defaultTags.push(year);
        if (ext) defaultTags.push(ext.toUpperCase());

        if (resolvedLyrics) {
          matchedLyricsUpdates[signature] = { rawText: resolvedLyrics, offsetSec: 0 };
        }

        newlyAdded.push({
          id: `local-${hashString(signature)}-${Date.now()}-${i}`,
          signature,
          fileName: file.name,
          title,
          artist,
          album,
          genre,
          year,
          duration: realDuration,
          url: objectUrl,
          artwork,
          hasEmbeddedArt: Boolean(id3.artworkUrl),
          folder: fallback.folder,
          format: ext.toUpperCase() || 'AUDIO',
          size: file.size,
          dateAdded: Date.now() + i,
          isDemo: false,
          sourceName: sourceLabel,
          defaultTags,
          defaultLyrics: resolvedLyrics,
        });
      }

      setIndexingState({ active: false, total: 0, processed: 0, currentFile: '' });

      if (Object.keys(matchedLyricsUpdates).length > 0) {
        setTrackLyricsMap((prev) => ({ ...prev, ...matchedLyricsUpdates }));
      }

      if (newlyAdded.length > 0) {
        setTracks((prev) => [...newlyAdded, ...prev]);
        setSources((prev) => [
          {
            id: `src-${Date.now()}`,
            name: sourceLabel,
            type: 'Local Storage',
            trackCount: newlyAdded.length,
            unsupportedCount: newlyUnsupported.length,
            duplicateCount: duplicatesSkipped,
            connectedAt: Date.now(),
            status: 'Connected',
            isDemo: false,
          },
          ...prev,
        ]);
      }

      if (newlyUnsupported.length > 0) {
        setUnsupportedFiles((prev) => [...newlyUnsupported, ...prev].slice(0, 60));
      }

      if (newlyAdded.length > 0) {
        const dupMsg = duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicate${duplicatesSkipped > 1 ? 's' : ''} skipped)` : '';
        const lrcMsg = matchedLrcCount > 0 ? ` • ${matchedLrcCount} .lrc matched` : '';
        pushToast(`Indexed ${newlyAdded.length} local track${newlyAdded.length > 1 ? 's' : ''}${lrcMsg}${dupMsg}`, 'success');
      } else if (matchedLrcCount > 0) {
        pushToast(`Matched ${matchedLrcCount} .lrc lyric file${matchedLrcCount > 1 ? 's' : ''} to existing songs.`, 'success');
      } else if (duplicatesSkipped > 0) {
        pushToast(`All ${duplicatesSkipped} selected file(s) are already in your library.`, 'info');
      } else if (newlyUnsupported.length > 0) {
        pushToast(`No playable audio found. ${newlyUnsupported.length} unsupported file(s) logged in Storage Manager.`, 'warning');
      }
    },
    [pushToast, tracks, getTrackKey]
  );

  // Trigger native folder picker (showDirectoryPicker with webkitdirectory fallback)
  const handleSelectFolder = useCallback(async () => {
    if (typeof window.showDirectoryPicker === 'function') {
      try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        const collected = [];

        const walkDir = async (handle, path = '') => {
          for await (const [name, entry] of handle.entries()) {
            const nextPath = path ? `${path}/${name}` : name;
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              collected.push({ file, relativePath: nextPath });
            } else if (entry.kind === 'directory') {
              await walkDir(entry, nextPath);
            }
          }
        };

        await walkDir(dirHandle, dirHandle.name);
        await processIncomingFiles(collected, `Folder: ${dirHandle.name}`);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        // Fallback to hidden input if File System Access API is blocked in sandbox/iframe
      }
    }
    folderInputRef.current?.click();
  }, [processIncomingFiles]);

  const handleSelectFiles = useCallback(() => {
    filesInputRef.current?.click();
  }, []);

  const handleFolderInputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const rootName = files[0].webkitRelativePath
      ? files[0].webkitRelativePath.split('/')[0]
      : 'Local Folder';
    const entries = files.map((file) => ({
      file,
      relativePath: file.webkitRelativePath || file.name,
    }));
    await processIncomingFiles(entries, `Folder: ${rootName}`);
    e.target.value = '';
  };

  const handleFilesInputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const entries = files.map((file) => ({
      file,
      relativePath: file.name,
    }));
    await processIncomingFiles(entries, 'Selected Audio Files');
    e.target.value = '';
  };

  // ---- Load Optional Synthesized Demo Tracks ----
  const handleLoadDemoTracks = useCallback(
    (silent = false) => {
      const isSilent = silent === true;
      const existingDemo = tracks.some((t) => t.isDemo);
      if (existingDemo) {
        if (!isSilent) pushToast('Demo tracks are already loaded in your library.', 'info');
        return;
      }

      const demoTracks = DEMO_TRACK_PRESETS.map((preset, idx) => {
        const blob = synthesizeDemoTrackBlob(preset);
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.add(url);
        return {
          id: preset.id,
          signature: `demo_${preset.id}`,
          title: preset.title,
          artist: preset.artist,
          album: preset.album,
          genre: preset.genre,
          year: preset.year,
          duration: preset.duration,
          url,
          artwork: generateArtworkSVG(`${preset.album} ${preset.artist}`, preset.title),
          hasEmbeddedArt: false,
          folder: '/Demo Mode / Synthesized Audio',
          format: 'WAV',
          size: blob.size,
          dateAdded: Date.now() - (DEMO_TRACK_PRESETS.length - idx) * 60000,
          isDemo: true,
          sourceName: 'Built-in Demo Mode',
          defaultTags: preset.tags || [preset.genre],
          defaultLyrics: preset.lyrics || '',
        };
      });

      setTracks((prev) => [...prev, ...demoTracks]);
      setSources((prev) => [
        ...prev,
        {
          id: 'src-demo-mode',
          name: 'Built-in Demo Mode (Synthesized WAV)',
          type: 'Demo Audio',
          trackCount: demoTracks.length,
          unsupportedCount: 0,
          duplicateCount: 0,
          connectedAt: Date.now(),
          status: 'Demo Active',
          isDemo: true,
        },
      ]);
      if (!isSilent) {
        pushToast('Loaded 6 synthesized Demo tracks. You can also import your own local music anytime.', 'success');
      }
    },
    [tracks, pushToast]
  );

  // Auto-load playable synthesized demo showcase on initial boot for live portfolio visitors
  useEffect(() => {
    if (didBootDemoRef.current) return;
    didBootDemoRef.current = true;
    handleLoadDemoTracks(true);
  }, [handleLoadDemoTracks]);

  const handleRemoveSource = useCallback(
    (source) => {
      setTracks((prev) => {
        const remaining = [];
        prev.forEach((t) => {
          if (t.sourceName === source.name && t.isDemo === source.isDemo) {
            signatureSetRef.current.delete(t.signature);
            if (currentTrackId === t.id) {
              setIsPlaying(false);
              setCurrentTrackId(null);
            }
          } else {
            remaining.push(t);
          }
        });
        return remaining;
      });
      setSources((prev) => prev.filter((s) => s.id !== source.id));
      pushToast(`Disconnected "${source.name}"`, 'info');
    },
    [currentTrackId, pushToast]
  );

  // ---- Global Drag & Drop Handlers ----
  useEffect(() => {
    let dragCounter = 0;

    const onDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDraggingOver(true);
      }
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingOver(false);
      }
    };
    const onDrop = async (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingOver(false);
      if (e.dataTransfer) {
        const entries = await collectFilesFromDataTransfer(e.dataTransfer);
        if (entries.length > 0) {
          await processIncomingFiles(entries, 'Drag & Drop Import');
        }
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [processIncomingFiles]);

  // ============================================================================
  // 9. AUDIO PLAYBACK ENGINE & MEDIA SESSION API
  // ============================================================================

  const recordTrackPlay = useCallback((trackId) => {
    setPlayCounts((prev) => ({
      ...prev,
      [trackId]: (prev[trackId] || 0) + 1,
    }));
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.trackId !== trackId);
      return [{ trackId, playedAt: Date.now() }, ...filtered].slice(0, 120);
    });
  }, []);

  const playTrack = useCallback(
    (trackId, contextTrackIds = null) => {
      const target = trackMap.get(trackId);
      if (!target) return;

      setAudioError(null);
      if (contextTrackIds && contextTrackIds.length > 0) {
        setQueue(contextTrackIds);
      } else if (!queue.includes(trackId)) {
        setQueue((prev) => [trackId, ...prev]);
      }

      if (currentTrackId === trackId && audioRef.current) {
        audioRef.current.play().catch((err) => {
          setAudioError('Playback was blocked or interrupted.');
          pushToast(`Playback error: ${err?.message || 'Unable to play track'}`, 'error');
        });
        setIsPlaying(true);
      } else {
        setCurrentTrackId(trackId);
        setIsPlaying(true);
        recordTrackPlay(trackId);
      }
    },
    [trackMap, queue, currentTrackId, recordTrackPlay, pushToast]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0].id, tracks.map((t) => t.id));
      }
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAudioError('Unable to resume playback.');
          pushToast('Unable to resume playback. Try re-selecting the track.', 'error');
        });
    }
  }, [currentTrack, isPlaying, tracks, playTrack, pushToast]);

  const playNext = useCallback(
    (autoAdvance = false) => {
      if (queue.length === 0) return;
      const currentIdx = queue.indexOf(currentTrackId);

      if (autoAdvance && repeat === 'one' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        return;
      }

      if (shuffle && queue.length > 1) {
        let nextIdx = currentIdx;
        while (nextIdx === currentIdx) {
          nextIdx = Math.floor(Math.random() * queue.length);
        }
        const nextId = queue[nextIdx];
        setCurrentTrackId(nextId);
        setIsPlaying(true);
        recordTrackPlay(nextId);
        return;
      }

      if (currentIdx + 1 < queue.length) {
        const nextId = queue[currentIdx + 1];
        setCurrentTrackId(nextId);
        setIsPlaying(true);
        recordTrackPlay(nextId);
      } else if (repeat === 'all' && queue.length > 0) {
        const nextId = queue[0];
        setCurrentTrackId(nextId);
        setIsPlaying(true);
        recordTrackPlay(nextId);
      } else {
        setIsPlaying(false);
      }
    },
    [queue, currentTrackId, repeat, shuffle, recordTrackPlay]
  );

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (queue.length === 0) return;
    const currentIdx = queue.indexOf(currentTrackId);
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : repeat === 'all' ? queue.length - 1 : 0;
    const prevId = queue[prevIdx];
    if (prevId) {
      setCurrentTrackId(prevId);
      setIsPlaying(true);
      recordTrackPlay(prevId);
    }
  }, [queue, currentTrackId, repeat, recordTrackPlay]);

  const handleSeek = useCallback((newTime) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(newTime)) return;
    const clamped = Math.max(0, Math.min(audio.duration || 0, newTime));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  // Load new track source into persistent <audio> element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.src = currentTrack.url;
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;
    audio.load();

    if (isPlaying) {
      audio
        .play()
        .then(() => setAudioError(null))
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            setIsPlaying(false);
            setAudioError('Audio codec or playback error.');
            pushToast(`Could not play "${currentTrack.title}". Format may not be supported by this browser.`, 'error');
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackId]);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Media Session API integration (OS lockscreen / hardware media keys)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: currentTrack.artwork, sizes: '512x512', type: 'image/svg+xml' },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) handleSeek(details.seekTime);
      });
    } catch {
      // Media Session optional in some browsers
    }
  }, [currentTrack, isPlaying, togglePlayPause, playPrev, playNext, handleSeek]);

  // Dynamic browser tab title for live portfolio polish
  useEffect(() => {
    if (currentTrack && isPlaying) {
      document.title = `▶ ${currentTrack.title} — Cloud Sound Studio`;
    } else if (currentTrack) {
      document.title = `${currentTrack.title} — Cloud Sound Studio`;
    } else {
      document.title = 'Cloud Sound Studio — Offline Hi-Fi Music Player';
    }
  }, [currentTrack, isPlaying]);

  // Global Keyboard Shortcuts (disabled when typing in inputs)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek((audioRef.current?.currentTime || 0) + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek((audioRef.current?.currentTime || 0) - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setIsMuted(false);
        setVolume((v) => Math.min(1, +(v + 0.05).toFixed(2)));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => Math.max(0, +(v - 0.05).toFixed(2)));
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((m) => !m);
      } else if (e.key === 'n' || e.key === 'N') {
        playNext(false);
      } else if (e.key === 'p' || e.key === 'P') {
        playPrev();
      } else if (e.key === 's' || e.key === 'S') {
        setShuffle((s) => !s);
      } else if (e.key === 'r' || e.key === 'R') {
        setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentTrack) {
          setExpandedRightTab('lyrics');
          setIsExpandedPlayer((open) => !open);
        }
      } else if (e.key === 't' || e.key === 'T') {
        if (currentTrack) {
          setTagEditorTrackId((prev) => (prev === currentTrack.id ? null : currentTrack.id));
          setTagInputValue('');
        }
      } else if (e.key === 'Escape') {
        setIsExpandedPlayer(false);
        setShowQueueDrawer(false);
        setTrackMenuId(null);
        setTagEditorTrackId(null);
        setShowLyricsEditor(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlayPause, handleSeek, playNext, playPrev, currentTrack]);

  // Tap-to-Sync Enter shortcut when actively tapping lines
  useEffect(() => {
    if (!showLyricsEditor || lyricsEditorMode !== 'tap') return;
    const onTapKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStampTapLine();
      }
    };
    window.addEventListener('keydown', onTapKey);
    return () => window.removeEventListener('keydown', onTapKey);
  }, [showLyricsEditor, lyricsEditorMode, handleStampTapLine]);

  // ============================================================================
  // 10. DERIVED MUSIC COLLECTIONS (ALBUMS, ARTISTS, GENRES, TAGS, FOLDERS, SMART)
  // ============================================================================
  // 10. DERIVED MUSIC COLLECTIONS (ALBUMS, ARTISTS, GENRES, FOLDERS, SMART)
  // ============================================================================

  const albums = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const key = `${t.album}__${t.artist}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: t.album,
          artist: t.artist,
          year: t.year,
          artwork: t.artwork,
          tracks: [],
          totalDuration: 0,
          isDemo: t.isDemo,
        });
      }
      const entry = map.get(key);
      entry.tracks.push(t);
      entry.totalDuration += t.duration || 0;
      if (t.hasEmbeddedArt) entry.artwork = t.artwork;
      if (!t.isDemo) entry.isDemo = false;
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [tracks]);

  const artists = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const name = t.artist || 'Unknown Artist';
      if (!map.has(name)) {
        map.set(name, {
          name,
          artwork: t.artwork,
          tracks: [],
          albumKeys: new Set(),
          totalDuration: 0,
          isDemo: t.isDemo,
        });
      }
      const entry = map.get(name);
      entry.tracks.push(t);
      entry.albumKeys.add(`${t.album}__${t.artist}`);
      entry.totalDuration += t.duration || 0;
      if (!t.isDemo) entry.isDemo = false;
    });
    return Array.from(map.values())
      .map((a) => ({ ...a, albumCount: a.albumKeys.size }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const genres = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const g = t.genre || 'Uncategorized';
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(t);
    });
    return Array.from(map.entries())
      .map(([name, list]) => ({ name, tracks: list }))
      .sort((a, b) => b.tracks.length - a.tracks.length);
  }, [tracks]);

  const allTags = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const tags = getTrackTags(t);
      tags.forEach((tag) => {
        const norm = tag.trim();
        if (!norm) return;
        const key = norm.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name: norm, tracks: [] });
        }
        map.get(key).tracks.push(t);
      });
    });
    return Array.from(map.values()).sort(
      (a, b) => b.tracks.length - a.tracks.length || a.name.localeCompare(b.name)
    );
  }, [tracks, getTrackTags]);

  const folders = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const f = t.folder || '/Local Imports';
      if (!map.has(f)) map.set(f, []);
      map.get(f).push(t);
    });
    return Array.from(map.entries())
      .map(([path, list]) => ({ path, tracks: list }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [tracks]);

  const recentlyPlayedTracks = useMemo(
    () => history.map((h) => trackMap.get(h.trackId)).filter(Boolean),
    [history, trackMap]
  );

  const recentlyAddedTracks = useMemo(
    () => [...tracks].sort((a, b) => b.dateAdded - a.dateAdded),
    [tracks]
  );

  const favouriteTracks = useMemo(
    () => favourites.map((id) => trackMap.get(id)).filter(Boolean),
    [favourites, trackMap]
  );

  const mostPlayedTracks = useMemo(
    () =>
      [...tracks]
        .filter((t) => (playCounts[t.id] || 0) > 0)
        .sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0)),
    [tracks, playCounts]
  );

  const favouriteAlbums = useMemo(() => {
    const favSet = new Set(favourites);
    const matched = albums.filter((alb) => alb.tracks.some((t) => favSet.has(t.id)));
    return matched.length > 0 ? matched : albums.slice(0, 6);
  }, [albums, favourites]);

  // ============================================================================
  // 11. PLAYLIST, FAVOURITE & QUEUE ACTIONS
  // ============================================================================

  const toggleFavourite = useCallback(
    (trackId) => {
      setFavourites((prev) => {
        const exists = prev.includes(trackId);
        if (exists) {
          pushToast('Removed from Favourites', 'info');
          return prev.filter((id) => id !== trackId);
        }
        pushToast('Added to Favourites', 'success');
        return [trackId, ...prev];
      });
    },
    [pushToast]
  );

  const addToQueue = useCallback(
    (trackId) => {
      setQueue((prev) => (prev.includes(trackId) ? prev : [...prev, trackId]));
      pushToast('Added to Up Next queue', 'info');
    },
    [pushToast]
  );

  const moveQueueItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= queue.length) return;
    setQueue((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeQueueItem = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePlaylistModal = () => {
    const cleanName = playlistModal.name.trim();
    if (!cleanName) return;

    if (playlistModal.mode === 'create') {
      const newPl = {
        id: `pl-${Date.now()}`,
        name: cleanName,
        trackIds: [],
        createdAt: Date.now(),
      };
      setPlaylists((prev) => [newPl, ...prev]);
      setSelectedPlaylistId(newPl.id);
      pushToast(`Created playlist "${cleanName}"`, 'success');
    } else if (playlistModal.mode === 'rename' && playlistModal.playlistId) {
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === playlistModal.playlistId ? { ...pl, name: cleanName } : pl))
      );
      pushToast(`Renamed playlist to "${cleanName}"`, 'success');
    }
    setPlaylistModal({ open: false, mode: 'create', playlistId: null, name: '' });
  };

  const handleDeletePlaylist = (pl) => {
    setConfirmModal({
      title: 'Delete Playlist',
      message: `Are you sure you want to delete "${pl.name}"? Your audio files will remain untouched.`,
      confirmLabel: 'Delete Playlist',
      danger: true,
      onConfirm: () => {
        setPlaylists((prev) => prev.filter((p) => p.id !== pl.id));
        if (selectedPlaylistId === pl.id) setSelectedPlaylistId(null);
        pushToast(`Deleted playlist "${pl.name}"`, 'info');
        setConfirmModal(null);
      },
    });
  };

  const addTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.trackIds.includes(trackId)) return pl;
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      })
    );
    const pl = playlists.find((p) => p.id === playlistId);
    pushToast(`Added to "${pl?.name || 'Playlist'}"`, 'success');
    setAddToPlaylistTrack(null);
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) } : pl
      )
    );
    pushToast('Removed track from playlist', 'info');
  };

  const reorderPlaylistTrack = (playlistId, idx, dir) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const target = idx + dir;
        if (target < 0 || target >= pl.trackIds.length) return pl;
        const nextIds = [...pl.trackIds];
        [nextIds[idx], nextIds[target]] = [nextIds[target], nextIds[idx]];
        return { ...pl, trackIds: nextIds };
      })
    );
  };

  const handleClearLocalLibrary = () => {
    setConfirmModal({
      title: 'Clear Loaded Music Library',
      message: 'This disconnects all currently loaded local folders and demo tracks from this session. Your actual files on disk are never modified.',
      confirmLabel: 'Clear Library',
      danger: true,
      onConfirm: () => {
        setIsPlaying(false);
        setCurrentTrackId(null);
        setQueue([]);
        setTracks([]);
        setSources([]);
        setUnsupportedFiles([]);
        signatureSetRef.current.clear();
        pushToast('Session library cleared.', 'info');
        setConfirmModal(null);
      },
    });
  };

  const handleClearAllPersistedData = () => {
    setConfirmModal({
      title: 'Reset All Local Data',
      message: 'This will clear saved playlists, favourites, listening history, play counts, and preferences from your browser storage.',
      confirmLabel: 'Reset Everything',
      danger: true,
      onConfirm: () => {
        Object.values(STORAGE_KEYS).forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        });
        setPlaylists([]);
        setFavourites([]);
        setHistory([]);
        setPlayCounts({});
        setTrackTagsMap({});
        setTrackLyricsMap({});
        setProfile({
          name: 'Personal Studio',
          defaultSpeed: 1,
          gaplessEnabled: true,
        });
        pushToast('All local preferences and collections have been reset.', 'info');
        setConfirmModal(null);
      },
    });
  };

  // ============================================================================
  // 12. REUSABLE TRACK ROW COMPONENT
  // ============================================================================

  const renderTrackRow = (track, idx, contextIds, options = {}) => {
    const isCurrent = currentTrackId === track.id;
    const isFav = favourites.includes(track.id);
    const plays = playCounts[track.id] || 0;
    const rowTags = getTrackTags(track);

    return (
      <div
        key={`${track.id}-${idx}`}
        onDoubleClick={() => playTrack(track.id, contextIds)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer border ${
          isCurrent
            ? 'bg-white/[0.06] border-white/[0.12]'
            : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
        }`}
      >
        {/* Index / Play indicator */}
        <button
          onClick={() => (isCurrent ? togglePlayPause() : playTrack(track.id, contextIds))}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium shrink-0 transition-colors"
          style={isCurrent ? { color: theme.accent } : { color: '#7D8597' }}
          title={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <AudioLines className="w-4 h-4 animate-pulse" style={{ color: theme.accent }} />
          ) : (
            <>
              <span className="group-hover:hidden">{idx + 1}</span>
              <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current" />
            </>
          )}
        </button>

        {/* Cover & Title */}
        <div
          onClick={() => playTrack(track.id, contextIds)}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <img
            src={track.artwork}
            alt={track.album}
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10 bg-[#171B26]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-sm font-medium truncate"
                style={isCurrent ? { color: theme.accent } : { color: '#F1F5F9' }}
              >
                {track.title}
              </p>
              {track.isDemo && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArtistName(track.artist);
                  setActivePage('artists');
                }}
                className="hover:text-slate-200 hover:underline transition-colors"
              >
                {track.artist}
              </button>
              <span className="mx-1.5 text-slate-600">•</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAlbumKey(`${track.album}__${track.artist}`);
                  setActivePage('albums');
                }}
                className="hover:text-slate-200 hover:underline transition-colors"
              >
                {track.album}
              </button>
            </p>
          </div>
        </div>

        {/* Tags, Format & Plays (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {rowTags.slice(0, 2).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                navigateToTag(tag);
              }}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border border-white/[0.08] transition-colors"
              title={`Filter by #${tag}`}
            >
              #{tag}
            </button>
          ))}
          {rowTags.length > 2 && (
            <span className="text-[10px] text-slate-500">+{rowTags.length - 2}</span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-wide rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
            {track.format}
          </span>
          {plays > 0 && (
            <span className="text-[11px] text-slate-500 w-14 text-right">
              {plays} {plays === 1 ? 'play' : 'plays'}
            </span>
          )}
        </div>

        {/* Playlist Reorder Controls if inside playlist */}
        {options.playlistId && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                reorderPlaylistTrack(options.playlistId, idx, -1);
              }}
              disabled={idx === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25"
              title="Move up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reorderPlaylistTrack(options.playlistId, idx, 1);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Move down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Tag Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTagEditorTrackId(track.id);
            setTagInputValue('');
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors shrink-0"
          title="Edit Tags"
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Favourite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(track.id);
          }}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isFav ? 'text-rose-400' : 'text-slate-500 hover:text-slate-200'
          }`}
          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs font-mono text-slate-400 w-11 text-right shrink-0">
          {formatDuration(track.duration)}
        </span>

        {/* Context Menu Trigger */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTrackMenuId(trackMenuId === `${track.id}-${idx}` ? null : `${track.id}-${idx}`);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Track options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {trackMenuId === `${track.id}-${idx}` && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-9 z-40 w-48 py-1.5 rounded-xl bg-[#171B26] border border-white/10 shadow-2xl text-xs"
            >
              <button
                onClick={() => {
                  addToQueue(track.id);
                  setTrackMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <ListOrdered className="w-3.5 h-3.5 text-slate-400" /> Add to Queue
              </button>
              <button
                onClick={() => {
                  setAddToPlaylistTrack(track);
                  setTrackMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" /> Add to Playlist
              </button>
              <button
                onClick={() => {
                  setTagEditorTrackId(track.id);
                  setTagInputValue('');
                  setTrackMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Edit Song Tags
              </button>
              <button
                onClick={() => {
                  setSelectedArtistName(track.artist);
                  setActivePage('artists');
                  setTrackMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-200 hover:bg-white/[0.06] flex items-center gap-2.5"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" /> Go to Artist
              </button>
              {options.playlistId && (
                <button
                  onClick={() => {
                    removeTrackFromPlaylist(options.playlistId, track.id);
                    setTrackMenuId(null);
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 border-t border-white/[0.06] mt-1 pt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // 13. PAGE VIEWS
  // ============================================================================

  // ---- PAGE 1: HOME / DISCOVER ----
  const renderHomePage = () => {
    const localCount = tracks.filter((t) => !t.isDemo).length;
    const demoCount = tracks.filter((t) => t.isDemo).length;
    const stageTrack = currentTrack || tracks[0] || null;
    const stageIsPlaying = Boolean(currentTrack && stageTrack && currentTrack.id === stageTrack.id && isPlaying);
    const stageIsCurrent = Boolean(currentTrack && stageTrack && currentTrack.id === stageTrack.id);
    const stageTags = stageTrack ? getTrackTags(stageTrack) : [];
    const stageLyricsRecord = stageTrack ? getTrackLyricsRecord(stageTrack) : { rawText: '', offsetSec: 0 };
    const stageParsedLyrics = stageIsCurrent
      ? currentParsedLyrics
      : parseLRC(stageLyricsRecord.rawText);
    const stageOffsetSec = stageIsCurrent
      ? effectiveLyricsOffsetSec
      : (stageLyricsRecord.offsetSec || 0) + (stageParsedLyrics.offsetMs || 0) / 1000;

    const smartPlaylists = [
      {
        id: 'smart-most-played',
        title: 'Most Played',
        subtitle: `${mostPlayedTracks.length} tracks in heavy rotation`,
        tracks: mostPlayedTracks,
        icon: Sparkles,
      },
      {
        id: 'smart-recently-added',
        title: 'Recently Added',
        subtitle: `${recentlyAddedTracks.slice(0, 25).length} newest imports`,
        tracks: recentlyAddedTracks.slice(0, 25),
        icon: Clock,
      },
      {
        id: 'smart-favourites',
        title: 'Favourites Mix',
        subtitle: `${favouriteTracks.length} loved tracks`,
        tracks: favouriteTracks,
        icon: Heart,
      },
    ];

    return (
      <div className="space-y-6 pb-8">
        {/* Easy-Access Audiophile Tools Bar */}
        <section className="rounded-2xl px-4 py-3 bg-[#13151A] border border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-slate-300">Quick Tools</span>
              <span className="text-slate-600">•</span>
              <span>
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} • {albums.length} albums • {artists.length} artists
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectFolder}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0B0C0F] bg-slate-100 hover:bg-white transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Import Folder
              </button>
              <button
                onClick={handleSelectFiles}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.08] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Add Files
              </button>
              <button
                onClick={() => {
                  if (!stageTrack) {
                    pushToast('Load or import a song first to add tags.', 'info');
                    return;
                  }
                  setTagEditorTrackId(stageTrack.id);
                  setTagInputValue('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.08] transition-colors"
                title="Tag Playing Song (T)"
              >
                <Tag className="w-3.5 h-3.5 text-slate-300" /> Tags
              </button>
              <button
                onClick={() => {
                  if (!stageTrack) {
                    pushToast('Load or import a song first to attach .lrc lyrics.', 'info');
                    return;
                  }
                  if (!stageIsCurrent) playTrack(stageTrack.id, tracks.map((t) => t.id));
                  lrcInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.08] transition-colors"
                title="Attach .lrc synced lyrics file"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" /> .LRC
              </button>
              <button
                onClick={() => setShowQueueDrawer(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.08] transition-colors"
              >
                <ListOrdered className="w-3.5 h-3.5 text-slate-300" /> Queue ({queue.length})
              </button>
              {demoCount === 0 && (
                <button
                  onClick={handleLoadDemoTracks}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.12] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-300" /> Load Demo
                </button>
              )}
            </div>
          </div>
        </section>

        {/* AUDIOPHILE DECK + SIDE-BY-SIDE SYNCED LYRICS STAGE */}
        <section className="rounded-2xl bg-[#13151A] border border-white/[0.08] p-5 sm:p-6">
          {!stageTrack ? (
            /* Clean Empty Onboarding Deck */
            <div className="py-10 px-4 text-center space-y-5 max-w-2xl mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-[#1B1E26] border border-white/[0.1]">
                <AudioLines className="w-7 h-7 text-slate-100" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Cloud Sound Studio
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Import your local music folders or audio files for precision offline playback, ID3 metadata indexing, custom tagging, and time-synced lyrics.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                <button
                  onClick={handleSelectFolder}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0B0C0F] bg-slate-100 hover:bg-white transition-colors"
                >
                  <FolderOpen className="w-4 h-4" /> Import Music Folder
                </button>
                <button
                  onClick={handleLoadDemoTracks}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.1] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-slate-300" /> Load Built-in Demo Tracks
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
                {['MP3', 'FLAC', 'WAV', 'AAC', 'M4A', 'OGG', 'OPUS', '.LRC'].map((fmt) => (
                  <span key={fmt} className="px-2.5 py-1 rounded-lg bg-[#0E1014] border border-white/[0.06]">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Active Split Stage: Left = Precision Cover & Player Deck | Right = Live Synced Lyrics */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* LEFT: Cover Art + Now Playing Deck */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-5 p-4 sm:p-5 rounded-xl bg-[#0E1014] border border-white/[0.07]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Crisp Album Cover */}
                  <div className="relative shrink-0 group">
                    <img
                      src={stageTrack.artwork}
                      alt={stageTrack.album}
                      className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl object-cover border border-white/[0.1] shadow-xl bg-[#181B22]"
                    />
                    <button
                      onClick={() =>
                        stageIsCurrent
                          ? togglePlayPause()
                          : playTrack(stageTrack.id, tracks.map((t) => t.id))
                      }
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center text-[#0B0C0F] bg-slate-100 hover:bg-white shadow-xl transition-transform active:scale-95"
                      title={stageIsPlaying ? 'Pause' : 'Play'}
                    >
                      {stageIsPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Track Details & Live Tags */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-2.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                        {stageIsPlaying ? 'PLAYING' : stageIsCurrent ? 'PAUSED' : 'STANDBY'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-slate-400 border border-white/[0.07]">
                        {stageTrack.format}
                      </span>
                      {stageTrack.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          DEMO
                        </span>
                      )}
                    </div>

                    <div>
                      <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">
                        {stageTrack.title}
                      </h1>
                      <p className="text-sm text-slate-400 truncate mt-0.5">
                        <button
                          onClick={() => {
                            setSelectedArtistName(stageTrack.artist);
                            setActivePage('artists');
                          }}
                          className="text-slate-200 hover:text-white hover:underline"
                        >
                          {stageTrack.artist}
                        </button>
                        <span className="mx-1.5 text-slate-600">•</span>
                        <button
                          onClick={() => {
                            setSelectedAlbumKey(`${stageTrack.album}__${stageTrack.artist}`);
                            setActivePage('albums');
                          }}
                          className="text-slate-400 hover:text-slate-200 hover:underline"
                        >
                          {stageTrack.album}
                        </button>
                      </p>
                    </div>

                    {/* Live Tag Pills */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      {stageTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => navigateToTag(tag)}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#181B22] hover:bg-[#232732] text-slate-300 border border-white/[0.08] transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setTagEditorTrackId(stageTrack.id);
                          setTagInputValue('');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-dashed border-white/15 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      >
                        <Plus className="w-3 h-3" /> Tag
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integrated Precision Transport & Seek Deck */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={stageIsCurrent ? duration || 100 : stageTrack.duration || 100}
                      step={0.1}
                      value={stageIsCurrent ? currentTime : 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!stageIsCurrent) {
                          playTrack(stageTrack.id, tracks.map((t) => t.id));
                        }
                        handleSeek(val);
                      }}
                      className="w-full h-1 cursor-pointer"
                      style={{ accentColor: theme.accent }}
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{formatDuration(stageIsCurrent ? currentTime : 0)}</span>
                      <span>{formatDuration(stageIsCurrent ? duration : stageTrack.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavourite(stageTrack.id)}
                        className={`p-2 rounded-lg border border-white/[0.07] bg-[#151820] hover:bg-[#1E222D] transition-colors ${
                          favourites.includes(stageTrack.id) ? 'text-rose-400' : 'text-slate-400'
                        }`}
                        title="Favourite"
                      >
                        <Heart className={`w-4 h-4 ${favourites.includes(stageTrack.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          const speeds = [0.75, 1, 1.25, 1.5, 2];
                          setPlaybackRate(speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]);
                        }}
                        className="px-2.5 py-2 rounded-lg text-[11px] font-mono text-slate-300 bg-[#151820] hover:bg-[#1E222D] border border-white/[0.07]"
                        title="Playback Speed"
                      >
                        {playbackRate}x
                      </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setShuffle((s) => !s)}
                        className="p-2 rounded-lg hover:bg-white/[0.06]"
                        style={{ color: shuffle ? '#FFFFFF' : '#64748B' }}
                        title="Shuffle"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={playPrev}
                        className="p-2 rounded-lg text-slate-200 hover:bg-white/[0.08]"
                        title="Previous"
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() =>
                          stageIsCurrent
                            ? togglePlayPause()
                            : playTrack(stageTrack.id, tracks.map((t) => t.id))
                        }
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#0B0C0F] bg-slate-100 hover:bg-white transition-transform active:scale-95"
                      >
                        {stageIsPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() => playNext(false)}
                        className="p-2 rounded-lg text-slate-200 hover:bg-white/[0.08]"
                        title="Next"
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() =>
                          setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
                        }
                        className="p-2 rounded-lg hover:bg-white/[0.06]"
                        style={{ color: repeat !== 'off' ? '#FFFFFF' : '#64748B' }}
                        title={`Repeat: ${repeat}`}
                      >
                        {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (!stageIsCurrent) playTrack(stageTrack.id, tracks.map((t) => t.id));
                        setExpandedRightTab('lyrics');
                        setIsExpandedPlayer(true);
                      }}
                      className="p-2 rounded-lg bg-[#151820] hover:bg-[#1E222D] border border-white/[0.07] text-slate-300 hover:text-white"
                      title="Expand Player"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: Live Synced Lyrics Panel right aside the Cover & Player */}
              <div className="lg:col-span-6 flex flex-col rounded-xl bg-[#0E1014] border border-white/[0.07] p-4 sm:p-5 h-[340px] lg:h-auto lg:max-h-[385px]">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Synced Lyrics
                    </span>
                    {stageParsedLyrics.isSynced && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.07] text-slate-300">
                        SYNCED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {stageParsedLyrics.isSynced && (
                      <>
                        <button
                          onClick={() => adjustLyricsOffset(stageTrack, -0.5)}
                          className="px-2 py-1 rounded-md text-[10px] font-mono bg-[#181B22] hover:bg-[#232732] text-slate-300 border border-white/[0.06]"
                          title="Shift lyrics earlier"
                        >
                          -0.5s
                        </button>
                        <button
                          onClick={() => adjustLyricsOffset(stageTrack, 0.5)}
                          className="px-2 py-1 rounded-md text-[10px] font-mono bg-[#181B22] hover:bg-[#232732] text-slate-300 border border-white/[0.06]"
                          title="Shift lyrics later"
                        >
                          +0.5s
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (!stageIsCurrent) playTrack(stageTrack.id, tracks.map((t) => t.id));
                        setExpandedRightTab('lyrics');
                        setIsExpandedPlayer(true);
                        handleOpenLyricsEditor();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#181B22] hover:bg-[#232732] text-slate-200 border border-white/[0.08]"
                    >
                      <PenLine className="w-3 h-3" /> Sync / Edit
                    </button>
                  </div>
                </div>

                {stageParsedLyrics.lines.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-3">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-slate-300 font-medium">
                      No lyrics attached to "{stageTrack.title}" yet
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Attach a local .lrc file or use Tap-to-Sync to display time-synced lyrics alongside your cover art.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => {
                          if (!stageIsCurrent) playTrack(stageTrack.id, tracks.map((t) => t.id));
                          lrcInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B0C0F] bg-slate-100 hover:bg-white"
                      >
                        <Upload className="w-3.5 h-3.5" /> Attach .LRC
                      </button>
                      <button
                        onClick={() => {
                          if (!stageIsCurrent) playTrack(stageTrack.id, tracks.map((t) => t.id));
                          setExpandedRightTab('lyrics');
                          setIsExpandedPlayer(true);
                          handleOpenLyricsEditor();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-[#181B22] hover:bg-[#232732] border border-white/[0.08]"
                      >
                        <PenLine className="w-3.5 h-3.5" /> Tap-to-Sync
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    ref={homeLyricsContainerRef}
                    className="relative flex-1 overflow-y-auto py-5 px-1 sm:px-2 space-y-2 scroll-smooth"
                  >
                    {stageParsedLyrics.lines.map((line, idx) => {
                      const isActive =
                        stageIsCurrent && stageParsedLyrics.isSynced && idx === activeLyricIndex;
                      const isPast =
                        stageIsCurrent && stageParsedLyrics.isSynced && idx < activeLyricIndex;
                      return (
                        <button
                          key={`home-lyr-${idx}-${line.time}`}
                          ref={isActive ? homeActiveLyricRef : null}
                          onClick={() => {
                            if (stageParsedLyrics.isSynced && line.time !== null) {
                              if (!stageIsCurrent) {
                                playTrack(stageTrack.id, tracks.map((t) => t.id));
                              }
                              handleSeek(Math.max(0, line.time - stageOffsetSec));
                            }
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-baseline gap-2.5 ${
                            stageParsedLyrics.isSynced
                              ? 'cursor-pointer hover:bg-white/[0.04]'
                              : 'cursor-default'
                          } ${isActive ? 'bg-white/[0.08] border-l-2 border-slate-100' : ''}`}
                        >
                          {stageParsedLyrics.isSynced && (
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isActive ? 'text-slate-200' : 'text-slate-600'
                              }`}
                            >
                              {formatDuration(line.time)}
                            </span>
                          )}
                          <span
                            className={`leading-snug transition-colors duration-200 ${
                              isActive
                                ? 'text-base font-semibold text-white'
                                : isPast
                                ? 'text-sm text-slate-500'
                                : 'text-sm text-slate-400'
                            }`}
                          >
                            {line.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Quick Library Stats Strip */}
        {tracks.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Local Tracks', value: localCount, action: () => setActivePage('library') },
                { label: 'Albums', value: albums.length, action: () => setActivePage('albums') },
                { label: 'Artists', value: artists.length, action: () => setActivePage('artists') },
                { label: 'Active Tags', value: allTags.length, action: () => { setLibraryTab('tags'); setActivePage('library'); } },
              ].map((stat) => (
                <button
                  key={stat.label}
                  onClick={stat.action}
                  className="text-left px-4 py-3.5 rounded-2xl bg-[#11141D]/85 hover:bg-[#171C2A] border border-white/[0.07] transition-all"
                  style={{ boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.04)` }}
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="text-xl font-semibold text-white mt-0.5">{stat.value}</p>
                </button>
              ))}
            </div>

            {/* Smart Auto-Playlists */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Smart Collections</h2>
                <span className="text-xs text-slate-500">Generated from your library</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {smartPlaylists.map((sp) => {
                  const Icon = sp.icon;
                  return (
                    <div
                      key={sp.id}
                      onClick={() => {
                        if (sp.tracks.length > 0) {
                          playTrack(sp.tracks[0].id, sp.tracks.map((t) => t.id));
                        } else {
                          pushToast(`"${sp.title}" has no tracks yet.`, 'info');
                        }
                      }}
                      className="group p-5 rounded-2xl bg-[#11141D]/85 hover:bg-[#171B26] border border-white/[0.07] hover:border-white/[0.15] transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.05] border border-white/[0.08]">
                          <Icon className="w-5 h-5 text-slate-200" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{sp.title}</h3>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{sp.subtitle}</p>
                        </div>
                      </div>
                      <button
                        className="w-9 h-9 rounded-full flex items-center justify-center opacity-85 group-hover:opacity-100 transition-transform group-hover:scale-105 shrink-0 text-[#090B10]"
                        style={{ backgroundColor: theme.accent }}
                        title={`Play ${sp.title}`}
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recently Played */}
            {recentlyPlayedTracks.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Recently Played</h2>
                  <button
                    onClick={() => {
                      setLibraryTab('recentPlayed');
                      setActivePage('library');
                    }}
                    className="text-xs font-medium hover:underline"
                    style={{ color: theme.accent }}
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentlyPlayedTracks.slice(0, 6).map((track) => (
                    <div
                      key={`rp-${track.id}`}
                      onClick={() => playTrack(track.id, recentlyPlayedTracks.map((t) => t.id))}
                      className="group p-3 rounded-2xl bg-[#11141D]/85 hover:bg-[#171B26] border border-white/[0.06] transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/[0.08]">
                        <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[#090B10] shadow-xl"
                            style={{ backgroundColor: theme.accent }}
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        {track.isDemo && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-black/70 text-amber-300 border border-amber-400/30">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">{track.title}</p>
                      <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Favourite Albums */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Favourite Albums</h2>
                <button
                  onClick={() => {
                    setSelectedAlbumKey(null);
                    setActivePage('albums');
                  }}
                  className="text-xs font-medium hover:underline"
                  style={{ color: theme.accent }}
                >
                  Browse albums
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {favouriteAlbums.slice(0, 6).map((alb) => (
                  <div
                    key={alb.key}
                    onClick={() => {
                      setSelectedAlbumKey(alb.key);
                      setActivePage('albums');
                    }}
                    className="group p-3 rounded-2xl bg-[#11141D]/85 hover:bg-[#171B26] border border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/[0.08]">
                      <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" />
                      {alb.isDemo && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-black/70 text-amber-300 border border-amber-400/30">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{alb.title}</p>
                    <p className="text-xs text-slate-400 truncate">{alb.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently Added + Connected Sources Summary */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <section className="xl:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Recently Added</h2>
                  <button
                    onClick={() => {
                      setLibraryTab('recentAdded');
                      setActivePage('library');
                    }}
                    className="text-xs font-medium hover:underline"
                    style={{ color: theme.accent }}
                  >
                    Open Library
                  </button>
                </div>
                <div className="rounded-2xl bg-[#11141D]/85 border border-white/[0.07] p-2">
                  {recentlyAddedTracks
                    .slice(0, 5)
                    .map((t, i) =>
                      renderTrackRow(
                        t,
                        i,
                        recentlyAddedTracks.map((x) => x.id)
                      )
                    )}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Connected Sources</h2>
                  <button
                    onClick={() => setActivePage('storage')}
                    className="text-xs font-medium hover:underline"
                    style={{ color: theme.accent }}
                  >
                    Manage
                  </button>
                </div>
                <div className="rounded-2xl bg-[#11141D]/85 border border-white/[0.07] p-4 space-y-3">
                  {sources.map((src) => (
                    <div
                      key={src.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <HardDrive className="w-4 h-4 shrink-0" style={{ color: src.isDemo ? '#FBBF24' : theme.accent }} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{src.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {src.trackCount} tracks • {src.status}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-medium shrink-0 ${
                          src.isDemo
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {src.isDemo ? 'DEMO' : 'LOCAL'}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => setActivePage('storage')}
                    className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                  >
                    + Connect Storage or Cloud Connector
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    );
  };

  // ---- PAGE 2: MY LIBRARY ----
  const renderLibraryPage = () => {
    const tabs = [
      { id: 'songs', label: 'All Songs', count: tracks.length },
      { id: 'albums', label: 'Albums', count: albums.length },
      { id: 'artists', label: 'Artists', count: artists.length },
      { id: 'genres', label: 'Genres', count: genres.length },
      { id: 'tags', label: 'Tags', count: allTags.length },
      { id: 'folders', label: 'Folders', count: folders.length },
      { id: 'recentAdded', label: 'Recently Added', count: recentlyAddedTracks.length },
      { id: 'recentPlayed', label: 'Recently Played', count: recentlyPlayedTracks.length },
      { id: 'favourites', label: 'Favourites', count: favouriteTracks.length },
    ];

    const sortTracks = (list) => {
      const q = libraryFilter.trim().toLowerCase();
      const filtered = q
        ? list.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.artist.toLowerCase().includes(q) ||
              t.album.toLowerCase().includes(q) ||
              t.genre.toLowerCase().includes(q) ||
              getTrackTags(t).some((tag) => tag.toLowerCase().includes(q))
          )
        : [...list];

      filtered.sort((a, b) => {
        let cmp = 0;
        if (librarySort === 'title') cmp = a.title.localeCompare(b.title);
        else if (librarySort === 'artist') cmp = a.artist.localeCompare(b.artist);
        else if (librarySort === 'album') cmp = a.album.localeCompare(b.album);
        else if (librarySort === 'duration') cmp = (a.duration || 0) - (b.duration || 0);
        else cmp = (a.dateAdded || 0) - (b.dateAdded || 0);
        return librarySortDir === 'asc' ? cmp : -cmp;
      });
      return filtered;
    };

    const getTrackListForTab = () => {
      if (libraryTab === 'recentAdded') return sortTracks(recentlyAddedTracks);
      if (libraryTab === 'recentPlayed') return sortTracks(recentlyPlayedTracks);
      if (libraryTab === 'favourites') return sortTracks(favouriteTracks);
      return sortTracks(tracks);
    };

    const isTrackListTab = ['songs', 'recentAdded', 'recentPlayed', 'favourites'].includes(libraryTab);
    const displayedTracks = isTrackListTab ? getTrackListForTab() : [];

    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Library</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {tracks.length} tracks • {formatTotalDuration(tracks.reduce((a, b) => a + (b.duration || 0), 0))} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectFolder}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
              style={{ backgroundColor: theme.accent }}
            >
              <FolderOpen className="w-3.5 h-3.5" /> Add Folder
            </button>
            <button
              onClick={handleSelectFiles}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10"
            >
              <Upload className="w-3.5 h-3.5" /> Add Files
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const active = libraryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLibraryTab(tab.id);
                  setSelectedFolder(null);
                  setSelectedGenre(null);
                  if (tab.id !== 'tags') setSelectedTag(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'text-white border-white/15 bg-white/[0.09]'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                style={active ? { borderColor: theme.accentBorder, color: theme.accent } : {}}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] opacity-70">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Controls for Track List Tabs */}
        {isTrackListTab && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={libraryFilter}
                onChange={(e) => setLibraryFilter(e.target.value)}
                placeholder="Filter songs, artists, albums..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#11141D] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/25"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={librarySort}
                onChange={(e) => setLibrarySort(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#11141D] border border-white/[0.08] text-xs text-slate-200 focus:outline-none"
              >
                <option value="dateAdded">Sort: Date Added</option>
                <option value="title">Sort: Title</option>
                <option value="artist">Sort: Artist</option>
                <option value="album">Sort: Album</option>
                <option value="duration">Sort: Duration</option>
              </select>
              <button
                onClick={() => setLibrarySortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-2 rounded-xl bg-[#11141D] border border-white/[0.08] text-xs text-slate-300 hover:text-white"
              >
                {librarySortDir === 'asc' ? 'A → Z' : 'Z → A'}
              </button>
              {displayedTracks.length > 0 && (
                <button
                  onClick={() => playTrack(displayedTracks[0].id, displayedTracks.map((t) => t.id))}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {isTrackListTab && (
          <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-2">
            {displayedTracks.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                No tracks found in this view.
              </div>
            ) : (
              displayedTracks.map((t, i) =>
                renderTrackRow(
                  t,
                  i,
                  displayedTracks.map((x) => x.id)
                )
              )
            )}
          </div>
        )}

        {libraryTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {albums.map((alb) => (
              <div
                key={alb.key}
                onClick={() => {
                  setSelectedAlbumKey(alb.key);
                  setActivePage('albums');
                }}
                className="group p-3.5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] transition-all cursor-pointer"
              >
                <img
                  src={alb.artwork}
                  alt={alb.title}
                  className="aspect-square w-full rounded-xl object-cover mb-3 border border-white/[0.08]"
                />
                <p className="text-sm font-medium text-white truncate">{alb.title}</p>
                <p className="text-xs text-slate-400 truncate">{alb.artist}</p>
                <p className="text-[11px] text-slate-500 mt-1">{alb.tracks.length} tracks</p>
              </div>
            ))}
          </div>
        )}

        {libraryTab === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {artists.map((art) => (
              <div
                key={art.name}
                onClick={() => {
                  setSelectedArtistName(art.name);
                  setActivePage('artists');
                }}
                className="group p-4 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] transition-all cursor-pointer text-center"
              >
                <img
                  src={art.artwork}
                  alt={art.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-3 border-2 border-white/10"
                />
                <p className="text-sm font-semibold text-white truncate">{art.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {art.albumCount} {art.albumCount === 1 ? 'album' : 'albums'} • {art.tracks.length} tracks
                </p>
              </div>
            ))}
          </div>
        )}

        {libraryTab === 'genres' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {genres.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedGenre === g.name
                      ? 'bg-white/[0.08] border-white/20'
                      : 'bg-[#11141D] hover:bg-[#171B26] border-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4" style={{ color: theme.accent }} />
                    <span className="text-sm font-semibold text-white truncate">{g.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{g.tracks.length} tracks</p>
                </button>
              ))}
            </div>
            {selectedGenre && (
              <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-3 space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <h3 className="text-sm font-semibold text-white">Genre: {selectedGenre}</h3>
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                {(genres.find((g) => g.name === selectedGenre)?.tracks || []).map((t, i, arr) =>
                  renderTrackRow(
                    t,
                    i,
                    arr.map((x) => x.id)
                  )
                )}
              </div>
            )}
          </div>
        )}

        {libraryTab === 'tags' && (
          <div className="space-y-5">
            {allTags.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#11141D] border border-white/[0.07] text-sm text-slate-500">
                No song tags yet. Tag any track using the tag icon or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-xs">T</kbd> while playing.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {allTags.map((tagObj) => {
                    const isSelected = selectedTag?.toLowerCase() === tagObj.name.toLowerCase();
                    return (
                      <div
                        key={tagObj.name}
                        onClick={() => setSelectedTag(isSelected ? null : tagObj.name)}
                        className={`group p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-white/[0.09] border-white/25'
                            : 'bg-[#11141D] hover:bg-[#171B26] border-white/[0.07]'
                        }`}
                        style={isSelected ? { borderColor: theme.accentBorder } : {}}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                            <span className="text-sm font-semibold text-white truncate">
                              {tagObj.name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {tagObj.tracks.length} {tagObj.tracks.length === 1 ? 'song' : 'songs'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(
                              tagObj.tracks[0].id,
                              tagObj.tracks.map((t) => t.id)
                            );
                            pushToast(`Playing #${tagObj.name} Mix`, 'info');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#090B10] shrink-0 transition-transform active:scale-95"
                          style={{ backgroundColor: theme.accent }}
                          title={`Play #${tagObj.name} Mix`}
                        >
                          <Play className="w-3 h-3 fill-current" /> Play Mix
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedTag && (
                  <div className="rounded-2xl bg-[#11141D] border border-white/[0.08] p-3 space-y-2">
                    {(() => {
                      const activeTagObj = allTags.find(
                        (t) => t.name.toLowerCase() === selectedTag.toLowerCase()
                      );
                      const tagTracks = activeTagObj?.tracks || [];
                      return (
                        <>
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4" style={{ color: theme.accent }} />
                              <h3 className="text-sm font-semibold text-white">
                                {activeTagObj?.name || selectedTag}
                              </h3>
                              <span className="text-xs text-slate-400">({tagTracks.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {tagTracks.length > 0 && (
                                <button
                                  onClick={() =>
                                    playTrack(
                                      tagTracks[0].id,
                                      tagTracks.map((x) => x.id)
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#090B10]"
                                  style={{ backgroundColor: theme.accent }}
                                >
                                  <Play className="w-3 h-3 fill-current" /> Play Tag Mix
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTag(null)}
                                className="text-xs text-slate-400 hover:text-white px-2 py-1"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                          {tagTracks.map((t, i) =>
                            renderTrackRow(
                              t,
                              i,
                              tagTracks.map((x) => x.id)
                            )
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {libraryTab === 'folders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {folders.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setSelectedFolder(selectedFolder === f.path ? null : f.path)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selectedFolder === f.path
                      ? 'bg-white/[0.08] border-white/20'
                      : 'bg-[#11141D] hover:bg-[#171B26] border-white/[0.07]'
                  }`}
                >
                  <Folder className="w-5 h-5 shrink-0" style={{ color: theme.accent }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{f.path}</p>
                    <p className="text-xs text-slate-400">{f.tracks.length} audio files</p>
                  </div>
                </button>
              ))}
            </div>
            {selectedFolder && (
              <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-3 space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <h3 className="text-sm font-semibold text-white">Folder: {selectedFolder}</h3>
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                {(folders.find((f) => f.path === selectedFolder)?.tracks || []).map((t, i, arr) =>
                  renderTrackRow(
                    t,
                    i,
                    arr.map((x) => x.id)
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---- PAGE 3: SEARCH ----
  const renderSearchPage = () => {
    const q = searchQuery.trim().toLowerCase();
    const matchedTracks = q
      ? tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q) ||
            t.genre.toLowerCase().includes(q) ||
            getTrackTags(t).some((tag) => tag.toLowerCase().includes(q))
        )
      : [];
    const matchedAlbums = q
      ? albums.filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
      : [];
    const matchedArtists = q ? artists.filter((a) => a.name.toLowerCase().includes(q)) : [];
    const matchedPlaylists = q ? playlists.filter((p) => p.name.toLowerCase().includes(q)) : [];
    const matchedGenres = q ? genres.filter((g) => g.name.toLowerCase().includes(q)) : [];
    const matchedTags = q ? allTags.filter((tag) => tag.name.toLowerCase().includes(q)) : [];

    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Search Library</h1>
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, albums, genres, tags, or playlists..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#11141D] border border-white/10 text-base text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {!q ? (
          <div className="space-y-6">
            {allTags.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Popular Tags</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 14).map((tagObj) => (
                    <button
                      key={tagObj.name}
                      onClick={() => navigateToTag(tagObj.name)}
                      className="px-3.5 py-2 rounded-xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.08] text-xs font-medium text-slate-200 flex items-center gap-1.5"
                    >
                      <Hash className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                      {tagObj.name}
                      <span className="text-[11px] text-slate-500">({tagObj.tracks.length})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Browse Genres in Your Library</p>
              <div className="flex flex-wrap gap-2">
                {genres.length === 0 ? (
                  <p className="text-sm text-slate-500">Import local audio or load Demo Mode to search your library.</p>
                ) : (
                  genres.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setSearchQuery(g.name)}
                      className="px-4 py-2 rounded-xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.08] text-sm text-slate-200"
                    >
                      {g.name} <span className="text-xs text-slate-500 ml-1">({g.tracks.length})</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : matchedTracks.length === 0 &&
          matchedAlbums.length === 0 &&
          matchedArtists.length === 0 &&
          matchedPlaylists.length === 0 &&
          matchedGenres.length === 0 &&
          matchedTags.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#11141D] border border-white/[0.07]">
            <p className="text-slate-300 font-medium">No matches for "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching by track title, artist, album, tag, or genre.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {matchedTags.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Tags ({matchedTags.length})
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {matchedTags.map((tagObj) => (
                    <button
                      key={tagObj.name}
                      onClick={() => navigateToTag(tagObj.name)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.08]"
                    >
                      <Hash className="w-4 h-4" style={{ color: theme.accent }} />
                      <span className="text-sm font-medium text-white">{tagObj.name}</span>
                      <span className="text-xs text-slate-500">({tagObj.tracks.length})</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {matchedTracks.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Songs ({matchedTracks.length})
                </h2>
                <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-2">
                  {matchedTracks
                    .slice(0, 12)
                    .map((t, i) =>
                      renderTrackRow(
                        t,
                        i,
                        matchedTracks.map((x) => x.id)
                      )
                    )}
                </div>
              </section>
            )}

            {matchedAlbums.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Albums ({matchedAlbums.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {matchedAlbums.map((alb) => (
                    <div
                      key={alb.key}
                      onClick={() => {
                        setSelectedAlbumKey(alb.key);
                        setActivePage('albums');
                      }}
                      className="p-3 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] cursor-pointer"
                    >
                      <img src={alb.artwork} alt={alb.title} className="aspect-square rounded-xl object-cover mb-2.5" />
                      <p className="text-sm font-medium text-white truncate">{alb.title}</p>
                      <p className="text-xs text-slate-400 truncate">{alb.artist}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {matchedArtists.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Artists ({matchedArtists.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  {matchedArtists.map((art) => (
                    <button
                      key={art.name}
                      onClick={() => {
                        setSelectedArtistName(art.name);
                        setActivePage('artists');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07]"
                    >
                      <img src={art.artwork} alt={art.name} className="w-9 h-9 rounded-full object-cover" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{art.name}</p>
                        <p className="text-[11px] text-slate-400">{art.tracks.length} tracks</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {matchedPlaylists.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Playlists ({matchedPlaylists.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  {matchedPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        setSelectedPlaylistId(pl.id);
                        setActivePage('playlists');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07]"
                    >
                      <ListMusic className="w-4 h-4" style={{ color: theme.accent }} />
                      <span className="text-sm font-medium text-white">{pl.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---- PAGE 4: ALBUMS & ALBUM DETAIL ----
  const renderAlbumsPage = () => {
    const activeAlbum = selectedAlbumKey ? albums.find((a) => a.key === selectedAlbumKey) : null;

    if (activeAlbum) {
      const albumTrackIds = activeAlbum.tracks.map((t) => t.id);
      return (
        <div className="space-y-6 pb-8">
          <button
            onClick={() => setSelectedAlbumKey(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Albums
          </button>

          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-[#11141D] border border-white/[0.08]">
            <img
              src={activeAlbum.artwork}
              alt={activeAlbum.title}
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl border border-white/10 shrink-0"
            />
            <div className="flex flex-col justify-end space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-slate-400">Album</span>
                {activeAlbum.isDemo && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    DEMO
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-white">{activeAlbum.title}</h1>
              <p className="text-sm text-slate-300">
                <button
                  onClick={() => {
                    setSelectedArtistName(activeAlbum.artist);
                    setActivePage('artists');
                  }}
                  className="font-medium hover:underline"
                  style={{ color: theme.accent }}
                >
                  {activeAlbum.artist}
                </button>
                {activeAlbum.year && <span className="text-slate-500"> • {activeAlbum.year}</span>}
                <span className="text-slate-500">
                  {' '}
                  • {activeAlbum.tracks.length} {activeAlbum.tracks.length === 1 ? 'track' : 'tracks'} •{' '}
                  {formatTotalDuration(activeAlbum.totalDuration)}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => playTrack(albumTrackIds[0], albumTrackIds)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#090B10]"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Play className="w-4 h-4 fill-current" /> Play All
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...albumTrackIds].sort(() => Math.random() - 0.5);
                    setShuffle(true);
                    playTrack(shuffled[0], shuffled);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/10"
                >
                  <Shuffle className="w-4 h-4" /> Shuffle
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-2">
            {activeAlbum.tracks.map((t, i) => renderTrackRow(t, i, albumTrackIds))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Albums</h1>
            <p className="text-xs text-slate-400 mt-0.5">{albums.length} albums indexed</p>
          </div>
        </div>

        {albums.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#11141D] border border-white/[0.07] text-sm text-slate-500">
            No albums yet. Import local music folders or load Demo Mode.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {albums.map((alb) => (
              <div
                key={alb.key}
                onClick={() => setSelectedAlbumKey(alb.key)}
                className="group p-3.5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] transition-all cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/[0.08]">
                  <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(alb.tracks[0].id, alb.tracks.map((t) => t.id));
                    }}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-[#090B10] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
                    style={{ backgroundColor: theme.accent }}
                    title="Play album"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  {alb.isDemo && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-black/70 text-amber-300 border border-amber-400/30">
                      DEMO
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{alb.title}</p>
                <p className="text-xs text-slate-400 truncate">{alb.artist}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {alb.tracks.length} tracks • {formatTotalDuration(alb.totalDuration)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---- PAGE 5: ARTISTS & ARTIST PROFILE ----
  const renderArtistsPage = () => {
    const activeArtist = selectedArtistName ? artists.find((a) => a.name === selectedArtistName) : null;

    if (activeArtist) {
      const artistAlbums = albums.filter((a) => a.artist === activeArtist.name);
      const artistTrackIds = activeArtist.tracks.map((t) => t.id);

      return (
        <div className="space-y-6 pb-8">
          <button
            onClick={() => setSelectedArtistName(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Artists
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-[#11141D] border border-white/[0.08]">
            <img
              src={activeArtist.artwork}
              alt={activeArtist.name}
              className="w-36 h-36 rounded-full object-cover border-2 border-white/15 shadow-2xl shrink-0"
            />
            <div className="text-center sm:text-left space-y-2">
              <span className="text-xs uppercase tracking-widest text-slate-400">Artist Profile</span>
              <h1 className="text-3xl font-semibold text-white">{activeArtist.name}</h1>
              <p className="text-xs text-slate-400">
                {artistAlbums.length} {artistAlbums.length === 1 ? 'album' : 'albums'} • {activeArtist.tracks.length}{' '}
                tracks • {formatTotalDuration(activeArtist.totalDuration)}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                <button
                  onClick={() => playTrack(artistTrackIds[0], artistTrackIds)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-[#090B10]"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Play className="w-4 h-4 fill-current" /> Play All
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...artistTrackIds].sort(() => Math.random() - 0.5);
                    setShuffle(true);
                    playTrack(shuffled[0], shuffled);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/10"
                >
                  <Shuffle className="w-4 h-4" /> Shuffle
                </button>
              </div>
            </div>
          </div>

          {/* Albums by Artist */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {artistAlbums.map((alb) => (
                <div
                  key={alb.key}
                  onClick={() => {
                    setSelectedAlbumKey(alb.key);
                    setActivePage('albums');
                  }}
                  className="p-3 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] cursor-pointer"
                >
                  <img src={alb.artwork} alt={alb.title} className="aspect-square rounded-xl object-cover mb-2.5" />
                  <p className="text-sm font-medium text-white truncate">{alb.title}</p>
                  <p className="text-xs text-slate-400">{alb.tracks.length} tracks</p>
                </div>
              ))}
            </div>
          </section>

          {/* All Songs by Artist */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Songs</h2>
            <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-2">
              {activeArtist.tracks.map((t, i) => renderTrackRow(t, i, artistTrackIds))}
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Artists</h1>
          <p className="text-xs text-slate-400 mt-0.5">{artists.length} artists in your library</p>
        </div>

        {artists.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#11141D] border border-white/[0.07] text-sm text-slate-500">
            No artists indexed yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {artists.map((art) => (
              <div
                key={art.name}
                onClick={() => setSelectedArtistName(art.name)}
                className="group p-5 rounded-2xl bg-[#11141D] hover:bg-[#171B26] border border-white/[0.07] transition-all cursor-pointer text-center"
              >
                <img
                  src={art.artwork}
                  alt={art.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-3 border-2 border-white/10 group-hover:scale-105 transition-transform"
                />
                <p className="text-sm font-semibold text-white truncate">{art.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {art.albumCount} {art.albumCount === 1 ? 'album' : 'albums'} • {art.tracks.length} songs
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---- PAGE 6: PLAYLISTS ----
  const renderPlaylistsPage = () => {
    const activePl = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;
    const activePlTracks = activePl
      ? activePl.trackIds.map((id) => trackMap.get(id)).filter(Boolean)
      : [];

    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Playlists</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Curate custom collections saved locally in your browser
            </p>
          </div>
          <button
            onClick={() => setPlaylistModal({ open: true, mode: 'create', playlistId: null, name: '' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#090B10] self-start sm:self-auto"
            style={{ backgroundColor: theme.accent }}
          >
            <Plus className="w-4 h-4" /> New Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-3xl bg-[#11141D] border border-white/[0.07] space-y-3">
            <ListMusic className="w-10 h-10 mx-auto text-slate-500" />
            <h2 className="text-base font-semibold text-white">No Custom Playlists Yet</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create your first playlist, then use the menu button on any song to add tracks and arrange their order.
            </p>
            <button
              onClick={() => setPlaylistModal({ open: true, mode: 'create', playlistId: null, name: '' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
              style={{ backgroundColor: theme.accent }}
            >
              <Plus className="w-3.5 h-3.5" /> Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Playlist Sidebar List */}
            <div className="lg:col-span-4 space-y-2">
              {playlists.map((pl) => {
                const isSelected = activePl?.id === pl.id;
                const count = pl.trackIds.filter((id) => trackMap.has(id)).length;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/15'
                        : 'bg-[#11141D] hover:bg-[#171B26] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: isSelected ? theme.accentMuted : 'rgba(255,255,255,0.04)' }}
                      >
                        <ListMusic className="w-4 h-4" style={{ color: isSelected ? theme.accent : '#94A3B8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{pl.name}</p>
                        <p className="text-[11px] text-slate-400">{count} playable tracks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistModal({ open: true, mode: 'rename', playlistId: pl.id, name: pl.name });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        title="Rename playlist"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(pl);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Playlist Detail */}
            {activePl && (
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-[#11141D] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Playlist</span>
                    <h2 className="text-xl font-semibold text-white">{activePl.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activePlTracks.length} tracks •{' '}
                      {formatTotalDuration(activePlTracks.reduce((s, t) => s + (t.duration || 0), 0))}
                    </p>
                  </div>
                  {activePlTracks.length > 0 && (
                    <button
                      onClick={() =>
                        playTrack(
                          activePlTracks[0].id,
                          activePlTracks.map((t) => t.id)
                        )
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#090B10] self-start sm:self-auto"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Play className="w-4 h-4 fill-current" /> Play Playlist
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-[#11141D] border border-white/[0.07] p-2">
                  {activePlTracks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      This playlist is empty. Click the <span className="text-slate-300">•••</span> menu on any track in your library to add it here.
                    </div>
                  ) : (
                    activePlTracks.map((t, i) =>
                      renderTrackRow(
                        t,
                        i,
                        activePlTracks.map((x) => x.id),
                        { playlistId: activePl.id }
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---- PAGE 7: STORAGE MANAGER ----
  const renderStoragePage = () => {
    const progressPct =
      indexingState.total > 0 ? Math.round((indexingState.processed / indexingState.total) * 100) : 0;

    return (
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Storage Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Universal modular storage architecture — active local indexing with transparent cloud connector status
          </p>
        </div>

        {/* Real Local Storage Section */}
        <section className="rounded-3xl bg-[#11141D] border border-white/[0.08] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: theme.accentMuted }}
              >
                <HardDrive className="w-5 h-5" style={{ color: theme.accent }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">Local Device Storage</h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    ACTIVE OFFLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Index computer folders, external drives, USB drives, or audio + .lrc lyric files directly in your browser.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectFolder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                style={{ backgroundColor: theme.accent }}
              >
                <FolderOpen className="w-4 h-4" /> Connect Folder
              </button>
              <button
                onClick={handleSelectFiles}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/10"
              >
                <Upload className="w-4 h-4" /> Add Files
              </button>
              {tracks.length > 0 && (
                <button
                  onClick={handleClearLocalLibrary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Session
                </button>
              )}
            </div>
          </div>

          {/* Live Indexing Progress */}
          {indexingState.active && (
            <div className="p-4 rounded-2xl bg-[#090B10] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: theme.accent }} />
                  Indexing: {indexingState.currentFile}
                </span>
                <span className="font-mono text-slate-400">
                  {indexingState.processed} / {indexingState.total} ({progressPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${progressPct}%`, backgroundColor: theme.accent }}
                />
              </div>
            </div>
          )}

          {/* Connected Local Sources List */}
          {sources.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
              <p className="text-sm text-slate-300">No local folders connected yet.</p>
              <p className="text-xs text-slate-500">
                Drag and drop files/folders anywhere, or click "Connect Folder" above.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0D1018] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{ color: src.isDemo ? '#FBBF24' : '#34D399' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{src.name}</p>
                        {src.isDemo && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-300">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {src.trackCount} playable tracks
                        {src.duplicateCount > 0 ? ` • ${src.duplicateCount} duplicates skipped` : ''}
                        {src.unsupportedCount > 0 ? ` • ${src.unsupportedCount} unsupported` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSource(src)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/[0.06] self-start sm:self-auto"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Unsupported Files Warning Log */}
          {unsupportedFiles.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{unsupportedFiles.length} Unsupported File(s) Detected</span>
                </div>
                <button
                  onClick={() => setUnsupportedFiles([])}
                  className="text-[11px] text-amber-200/70 hover:text-amber-200"
                >
                  Dismiss
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {unsupportedFiles.map((uf) => (
                  <div key={uf.id} className="text-xs text-slate-300 flex items-start justify-between gap-3">
                    <span className="truncate font-mono text-[11px] text-amber-200/90">{uf.name}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{formatBytes(uf.size)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-amber-200/70">
                Supported browser audio formats: MP3, WAV, FLAC, AAC, M4A, OGG, and OPUS.
              </p>
            </div>
          )}
        </section>

        {/* Modular Cloud & Personal Server Connectors */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Cloud & Personal Server Connectors</h2>
              <p className="text-xs text-slate-400">
                Modular provider architecture designed for secure OAuth 2.0 & backend token exchange (never exposes keys in frontend).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CLOUD_CONNECTORS.map((conn) => {
              const Icon = conn.icon;
              return (
                <div
                  key={conn.id}
                  className="p-5 rounded-2xl bg-[#11141D] border border-white/[0.07] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-300" />
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-slate-800/90 text-slate-300 border border-white/10">
                        Backend OAuth Required — Offline Mode Active
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{conn.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {conn.category} • {conn.protocol}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{conn.description}</p>
                  </div>

                  <button
                    onClick={() => setConnectorInfoModal(conn)}
                    className="w-full py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" /> View Integration Requirements
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  // ---- PAGE 8: ACCOUNT SETTINGS ----
  const renderSettingsPage = () => {
    const shortcuts = [
      { key: 'Space', desc: 'Play / Pause' },
      { key: '← / →', desc: 'Seek backward / forward 5s' },
      { key: '↑ / ↓', desc: 'Volume up / down' },
      { key: 'M', desc: 'Toggle mute' },
      { key: 'N / P', desc: 'Next / Previous track' },
      { key: 'S', desc: 'Toggle shuffle' },
      { key: 'R', desc: 'Cycle repeat (Off / All / One)' },
      { key: 'L', desc: 'Open Synced Lyrics stage' },
      { key: 'T', desc: 'Open Quick Tag Editor for playing song' },
      { key: 'Esc', desc: 'Close immersive player, editor, or drawer' },
    ];

    return (
      <div className="space-y-6 pb-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-white">Account & Preferences</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize your offline listening environment — all settings stay private on this device
          </p>
        </div>

        {/* Local Profile */}
        <section className="p-6 rounded-2xl bg-[#13151A] border border-white/[0.08] space-y-4">
          <h2 className="text-sm font-semibold text-white">Local Profile</h2>
          <div className="max-w-md space-y-2">
            <label className="text-xs text-slate-400">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/10 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>
        </section>

        {/* Audio Preferences */}
        <section className="p-6 rounded-2xl bg-[#13151A] border border-white/[0.08] space-y-5">
          <h2 className="text-sm font-semibold text-white">Audio Playback Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Default Playback Speed</label>
              <div className="flex flex-wrap gap-2">
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setProfile((p) => ({ ...p, defaultSpeed: spd }));
                      setPlaybackRate(spd);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                      profile.defaultSpeed === spd
                        ? 'text-[#090B10] font-semibold border-transparent'
                        : 'text-slate-300 bg-[#090B10] border-white/10 hover:bg-white/[0.06]'
                    }`}
                    style={profile.defaultSpeed === spd ? { backgroundColor: theme.accent } : {}}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#090B10]/70 border border-white/[0.06]">
              <div>
                <p className="text-xs font-medium text-white">Gapless Transition Preference</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-buffer next track in queue where browser permits
                </p>
              </div>
              <button
                onClick={() => setProfile((p) => ({ ...p, gaplessEnabled: !p.gaplessEnabled }))}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  profile.gaplessEnabled ? '' : 'bg-slate-700'
                }`}
                style={profile.gaplessEnabled ? { backgroundColor: theme.accent } : {}}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#090B10] transition-transform ${
                    profile.gaplessEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts Guide */}
        <section className="p-6 rounded-2xl bg-[#11141D] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" style={{ color: theme.accent }} />
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#090B10]/60 border border-white/[0.05]"
              >
                <span className="text-xs text-slate-300">{s.desc}</span>
                <kbd className="px-2 py-0.5 text-[11px] font-mono rounded bg-white/[0.08] text-slate-200 border border-white/10">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy & Data Management */}
        <section className="p-6 rounded-2xl bg-[#11141D] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Clear Local Browser Data</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Removes saved playlists, favourites, listening history, play counts, and preferences from localStorage.
            </p>
          </div>
          <button
            onClick={handleClearAllPersistedData}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 shrink-0"
          >
            Reset Local Data
          </button>
        </section>
      </div>
    );
  };

  // ---- Page Router Switch ----
  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return renderHomePage();
      case 'library':
        return renderLibraryPage();
      case 'search':
        return renderSearchPage();
      case 'albums':
        return renderAlbumsPage();
      case 'artists':
        return renderArtistsPage();
      case 'playlists':
        return renderPlaylistsPage();
      case 'storage':
        return renderStoragePage();
      case 'settings':
        return renderSettingsPage();
      default:
        return renderHomePage();
    }
  };

  // ============================================================================
  // 14. NAVIGATION CONFIG & RENDER SHELL
  // ============================================================================

  const navItems = [
    { id: 'home', label: 'Discover', icon: Home },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'albums', label: 'Albums', icon: Disc3 },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const mobileNavItems = navItems.slice(0, 5).concat(navItems[6]); // Home, Library, Search, Albums, Artists, Storage

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      onClick={() => trackMenuId && setTrackMenuId(null)}
      className="h-screen w-full flex flex-col bg-[#090B10] text-slate-100 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Hidden Persistent HTML5 Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || currentTrack?.duration || 0)}
        onEnded={() => playNext(true)}
        onError={() => {
          if (currentTrack) {
            setIsPlaying(false);
            setAudioError('Playback error or unsupported codec.');
            pushToast(`Playback error on "${currentTrack.title}".`, 'error');
          }
        }}
      />

      {/* Hidden File & Folder Inputs */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderInputChange}
        className="hidden"
      />
      <input
        ref={filesInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg,.opus,.lrc"
        multiple
        onChange={handleFilesInputChange}
        className="hidden"
      />
      <input
        ref={lrcInputRef}
        type="file"
        accept=".lrc,.txt"
        onChange={handleAttachLrcFile}
        className="hidden"
      />

      {/* Global Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-[#090B10]/90 backdrop-blur-md flex items-center justify-center p-6">
          <div
            className="max-w-md w-full p-10 rounded-3xl border-2 border-dashed text-center space-y-3"
            style={{ borderColor: theme.accent, backgroundColor: theme.accentMuted }}
          >
            <Upload className="w-12 h-12 mx-auto" style={{ color: theme.accent }} />
            <h2 className="text-xl font-semibold text-white">Drop Audio Files or Folders</h2>
            <p className="text-xs text-slate-300">
              Cloud Sound Studio will automatically index metadata, album art, and add them to your offline library.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Area (Sidebar + Scrollable Page Content) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col shrink-0 bg-[#101216] border-r border-white/[0.07] transition-all duration-200 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Clean Brand Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setActivePage('home')}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center shrink-0">
                  <AudioLines className="w-5 h-5 text-slate-100" />
                </div>
                {!sidebarCollapsed && (
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold tracking-wide text-white truncate">Cloud Sound Studio</p>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Audio Engine</p>
                  </div>
                )}
              </button>
              <button
                onClick={() => setSidebarCollapsed((c) => !c)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06]"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (item.id === 'albums') setSelectedAlbumKey(null);
                    if (item.id === 'artists') setSelectedArtistName(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={active ? { color: theme.accent } : {}}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Bottom Quick Import */}
          <div className="p-3 border-t border-white/[0.06]">
            <button
              onClick={handleSelectFolder}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#090B10] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]`}
              style={{ backgroundColor: theme.accent }}
              title="Import Local Folder"
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Import Folder</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Persistent Top Bar with Highlighted Cloud Sound Studio Tab */}
          <header className="h-14 px-3 sm:px-6 flex items-center justify-between bg-[#101216] border-b border-white/[0.08] shrink-0">
            <div className="flex items-center h-full gap-3 min-w-0">
              {/* Highlighted Cloud Sound Studio Top Tab */}
              <button
                onClick={() => setActivePage('home')}
                className="relative h-full flex items-center gap-2.5 px-4 bg-[#181B22] border-x border-white/[0.1] text-white transition-colors hover:bg-[#1E222B] shrink-0"
                title="Cloud Sound Studio Deck"
              >
                <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-slate-100" />
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#0B0C0F] flex items-center justify-center shrink-0">
                  <AudioLines className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-white whitespace-nowrap">
                  Cloud Sound Studio
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/[0.1] text-slate-200 border border-white/[0.12]">
                  {isPlaying ? 'LIVE' : 'STUDIO'}
                </span>
              </button>

              {/* Current Active Section Breadcrumb (Desktop) */}
              {activePage !== 'home' && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 truncate">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="font-medium text-slate-200 truncate">
                    {navItems.find((n) => n.id === activePage)?.label || 'Studio'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Top Bar Quick Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[#151820] text-slate-300 border border-white/[0.07]">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                Offline Hi-Fi
              </span>
              <button
                onClick={handleSharePortfolioLink}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#151820] hover:bg-[#1E222B] border border-white/[0.08] transition-colors"
                title="Copy live portfolio link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => setShowAboutModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#151820] hover:bg-[#1E222B] border border-white/[0.08] transition-colors"
                title="Project Architecture & Features"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden md:inline">About</span>
              </button>
              <button
                onClick={handleSelectFolder}
                className="md:hidden p-2 rounded-lg text-[#0B0C0F] bg-slate-100 hover:bg-white"
                title="Import Local Folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePage('settings')}
                className="md:hidden p-2 rounded-lg text-slate-300 bg-white/[0.05] border border-white/[0.07]"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Scrollable Page View */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 bg-[#0B0C0F]">
            <div className="max-w-7xl mx-auto">{renderActivePage()}</div>
          </main>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 15. PERSISTENT GLOBAL AUDIO PLAYER BAR                                 */}
      {/* ====================================================================== */}
      <footer className="shrink-0 bg-[#101216] border-t border-white/[0.08] px-3 sm:px-6 py-2.5 z-30">
        {/* Interactive Top Seek Bar for Mobile */}
        <div className="sm:hidden mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            disabled={!currentTrack}
            className="w-full h-1 accent-amber-400 cursor-pointer"
            style={{ accentColor: theme.accent }}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 w-1/3">
            {currentTrack ? (
              <>
                <button
                  onClick={() => setIsExpandedPlayer(true)}
                  className="relative group shrink-0 rounded-xl overflow-hidden border border-white/10"
                  title="Open Immersive Player"
                >
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="w-11 h-11 sm:w-12 sm:h-12 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      onClick={() => setIsExpandedPlayer(true)}
                      className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:underline"
                    >
                      {currentTrack.title}
                    </p>
                    {currentTrack.isDemo && (
                      <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/15 text-amber-300">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    {currentTrack.artist}
                  </p>
                  {/* Live Clickable Tag Pills on Playing Song */}
                  <div className="hidden xl:flex items-center gap-1 mt-1 flex-wrap">
                    {getTrackTags(currentTrack)
                      .slice(0, 2)
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => navigateToTag(tag)}
                          className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-slate-300 border border-white/[0.08] transition-colors"
                          title={`View all #${tag} tracks`}
                        >
                          #{tag}
                        </button>
                      ))}
                    <button
                      onClick={() => {
                        setTagEditorTrackId(currentTrack.id);
                        setTagInputValue('');
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-dashed border-white/15 transition-colors"
                      title="Edit Tags (T)"
                    >
                      + Tag
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavourite(currentTrack.id)}
                  className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors shrink-0 ${
                    favourites.includes(currentTrack.id)
                      ? 'text-rose-400'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                  title="Toggle Favourite"
                >
                  <Heart
                    className={`w-4 h-4 ${favourites.includes(currentTrack.id) ? 'fill-current' : ''}`}
                  />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                  <Music className="w-5 h-5 text-slate-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-400">Ready to stream offline</p>
                  <p className="text-[11px] text-slate-600">Select a track to play</p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Transport Controls + Desktop Seek Bar */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShuffle((s) => !s)}
                className="hidden sm:inline-flex p-1.5 rounded-lg transition-colors"
                style={{ color: shuffle ? theme.accent : '#64748B' }}
                title="Shuffle (S)"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={playPrev}
                disabled={!currentTrack}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30"
                title="Previous (P)"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#090B10] shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: theme.accent }}
                title="Play / Pause (Space)"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={() => playNext(false)}
                disabled={!currentTrack}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30"
                title="Next (N)"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() =>
                  setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
                }
                className="hidden sm:inline-flex p-1.5 rounded-lg transition-colors"
                style={{ color: repeat !== 'off' ? theme.accent : '#64748B' }}
                title={`Repeat: ${repeat} (R)`}
              >
                {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Desktop Seek Bar */}
            <div className="hidden sm:flex items-center gap-2.5 w-full">
              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {formatDuration(currentTime)}
              </span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  disabled={!currentTrack}
                  className="w-full h-1 cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 w-10">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Right: Speed, Volume, Lyrics, Tags, Queue, Expand */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-1/3">
            {/* Synced Lyrics Button */}
            <button
              onClick={() => {
                if (!currentTrack) return;
                setExpandedRightTab('lyrics');
                setIsExpandedPlayer(true);
              }}
              disabled={!currentTrack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] disabled:opacity-30 transition-colors"
              style={
                currentTrack && currentParsedLyrics.lines.length > 0
                  ? { color: theme.accent, borderColor: theme.accentBorder }
                  : { color: '#94A3B8' }
              }
              title="Synced Lyrics (L)"
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Lyrics</span>
            </button>

            {/* Quick Tag Editor Button (Mobile/Tablet) */}
            <button
              onClick={() => {
                if (!currentTrack) return;
                setTagEditorTrackId(currentTrack.id);
                setTagInputValue('');
              }}
              disabled={!currentTrack}
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
              title="Edit Song Tags (T)"
            >
              <Tag className="w-4 h-4" />
            </button>

            {/* Playback Speed */}
            <button
              onClick={() => {
                const speeds = [0.75, 1, 1.25, 1.5, 2];
                const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
                setPlaybackRate(next);
              }}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07]"
              title="Playback Speed"
            >
              <Gauge className="w-3 h-3" />
              {playbackRate}x
            </button>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted((m) => !m)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setIsMuted(false);
                  setVolume(parseFloat(e.target.value));
                }}
                className="w-20 h-1 cursor-pointer"
                style={{ accentColor: theme.accent }}
              />
            </div>

            {/* Queue Drawer Toggle */}
            <button
              onClick={() => setShowQueueDrawer((q) => !q)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: showQueueDrawer ? theme.accent : '#94A3B8' }}
              title="Queue"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Expanded Immersive Player Toggle */}
            <button
              onClick={() => currentTrack && setIsExpandedPlayer(true)}
              disabled={!currentTrack}
              className="p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
              title="Immersive Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {audioError && (
          <p className="text-[11px] text-rose-400 text-center mt-1">{audioError}</p>
        )}
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden shrink-0 bg-[#090B10] border-t border-white/[0.07] px-2 py-1.5 flex items-center justify-around z-30">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg"
              style={{ color: active ? theme.accent : '#64748B' }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ====================================================================== */}
      {/* 16. QUEUE DRAWER                                                       */}
      {/* ====================================================================== */}
      {showQueueDrawer && (
        <div
          onClick={() => setShowQueueDrawer(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-[#0D1018] border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Up Next Queue</h3>
                <p className="text-[11px] text-slate-400">{queue.length} tracks queued</p>
              </div>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={() => setQueue(currentTrackId ? [currentTrackId] : [])}
                    className="text-[11px] text-slate-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-white/[0.05]"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowQueueDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {queue.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  Your queue is empty. Play a song or add tracks to Up Next.
                </div>
              ) : (
                queue.map((id, idx) => {
                  const t = trackMap.get(id);
                  if (!t) return null;
                  const active = id === currentTrackId;
                  return (
                    <div
                      key={`q-${id}-${idx}`}
                      className={`group flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                        active
                          ? 'bg-white/[0.08] border-white/15'
                          : 'bg-transparent hover:bg-white/[0.04] border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => playTrack(t.id)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                      >
                        <img
                          src={t.artwork}
                          alt={t.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-medium truncate"
                            style={active ? { color: theme.accent } : { color: '#F1F5F9' }}
                          >
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => moveQueueItem(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveQueueItem(idx, 1)}
                          disabled={idx === queue.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeQueueItem(idx)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                          title="Remove from queue"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 17. EXPANDED IMMERSIVE PLAYER (WITH SYNCED LYRICS & LIVE TAGS)         */}
      {/* ====================================================================== */}
      {isExpandedPlayer && currentTrack && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0C0F] overflow-y-auto">
          {/* Top Bar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <AudioLines className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">
                Now Playing • {currentTrack.format}
              </span>
              {currentTrack.isDemo && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300">
                  DEMO
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsExpandedPlayer(false);
                setShowLyricsEditor(false);
              }}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200"
              title="Minimize (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Immersive Split Body */}
          <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: Artwork, Track Info, Live Tags, Transport Controls */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-5">
              <div className="relative">
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.album}
                  className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-2xl object-cover shadow-2xl border border-white/[0.12] bg-[#16181F]"
                />
              </div>

              <div className="space-y-1.5 max-w-md w-full">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white truncate">
                  {currentTrack.title}
                </h1>
                <p className="text-sm text-slate-300 truncate">
                  {currentTrack.artist} • <span className="text-slate-400">{currentTrack.album}</span>
                </p>

                {/* Live Clickable Tag Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  {getTrackTags(currentTrack).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigateToTag(tag)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 border border-white/10 transition-colors"
                      title={`Filter library by #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setTagEditorTrackId(currentTrack.id);
                      setTagInputValue('');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-dashed border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Tag
                  </button>
                </div>
              </div>

              {/* Seek Bar */}
              <div className="w-full max-w-md space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Transport */}
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setShuffle((s) => !s)}
                  style={{ color: shuffle ? theme.accent : '#64748B' }}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={playPrev} className="p-2 text-slate-200 hover:text-white">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[#090B10] shadow-2xl transition-transform active:scale-95"
                  style={{ backgroundColor: theme.accent }}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>
                <button onClick={() => playNext(false)} className="p-2 text-slate-200 hover:text-white">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
                <button
                  onClick={() => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))}
                  style={{ color: repeat !== 'off' ? theme.accent : '#64748B' }}
                >
                  {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>

              {/* Extra Row: Favourite, Speed */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => toggleFavourite(currentTrack.id)}
                  className={`flex items-center gap-1.5 text-xs ${
                    favourites.includes(currentTrack.id) ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favourites.includes(currentTrack.id) ? 'fill-current' : ''}`} />
                  {favourites.includes(currentTrack.id) ? 'Favourited' : 'Favourite'}
                </button>

                <button
                  onClick={() => {
                    const speeds = [0.75, 1, 1.25, 1.5, 2];
                    setPlaybackRate(speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]);
                  }}
                  className="text-xs font-mono text-slate-300 px-2.5 py-1 rounded-lg bg-white/[0.06]"
                >
                  Speed {playbackRate}x
                </button>
              </div>
            </div>

            {/* Right Side: Interactive Synced Lyrics Stage / Up Next Switcher */}
            <div className="lg:col-span-7 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/[0.09] p-5 h-[520px] flex flex-col">
              {/* Right Panel Tabs + Lyrics Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-1.5 bg-[#090B10]/70 p-1 rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => setExpandedRightTab('lyrics')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      expandedRightTab === 'lyrics' ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={expandedRightTab === 'lyrics' ? { color: theme.accent } : {}}
                  >
                    <Mic2 className="w-3.5 h-3.5" /> Synced Lyrics
                  </button>
                  <button
                    onClick={() => {
                      setExpandedRightTab('queue');
                      setShowLyricsEditor(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      expandedRightTab === 'queue' ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={expandedRightTab === 'queue' ? { color: theme.accent } : {}}
                  >
                    <ListOrdered className="w-3.5 h-3.5" /> Up Next ({queue.length})
                  </button>
                </div>

                {expandedRightTab === 'lyrics' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => lrcInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]"
                      title="Attach .lrc file"
                    >
                      <Upload className="w-3 h-3" /> .LRC
                    </button>
                    <button
                      onClick={() =>
                        showLyricsEditor ? setShowLyricsEditor(false) : handleOpenLyricsEditor()
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]"
                      style={{ color: showLyricsEditor ? theme.accent : '#E2E8F0' }}
                    >
                      <PenLine className="w-3 h-3" /> {showLyricsEditor ? 'Close Editor' : 'Edit / Sync'}
                    </button>
                    {currentParsedLyrics.lines.length > 0 && (
                      <button
                        onClick={handleExportLrc}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]"
                        title="Download .lrc file"
                      >
                        <Download className="w-3 h-3" /> Export
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SYNCED LYRICS TAB */}
              {expandedRightTab === 'lyrics' && (
                <>
                  {/* Sync Offset Controls Bar */}
                  {!showLyricsEditor && currentParsedLyrics.isSynced && (
                    <div className="flex items-center justify-between gap-2 py-2.5 px-1 border-b border-white/[0.05] text-[11px]">
                      <span className="text-slate-400">
                        Click any line to seek • Sync Offset:{' '}
                        <span className="font-mono text-slate-200">
                          {currentLyricsRecord.offsetSec >= 0 ? '+' : ''}
                          {currentLyricsRecord.offsetSec.toFixed(1)}s
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustLyricsOffset(currentTrack, -0.5)}
                          className="px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 font-mono"
                        >
                          -0.5s
                        </button>
                        <button
                          onClick={() => adjustLyricsOffset(currentTrack, -0.1)}
                          className="px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 font-mono"
                        >
                          -0.1s
                        </button>
                        <button
                          onClick={() => adjustLyricsOffset(currentTrack, 0, true)}
                          className="p-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300"
                          title="Reset Offset"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustLyricsOffset(currentTrack, 0.1)}
                          className="px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 font-mono"
                        >
                          +0.1s
                        </button>
                        <button
                          onClick={() => adjustLyricsOffset(currentTrack, 0.5)}
                          className="px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 font-mono"
                        >
                          +0.5s
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Built-in Lyrics Editor & Live Tap-to-Sync Mode */}
                  {showLyricsEditor ? (
                    <div className="flex-1 flex flex-col gap-3 pt-3 min-h-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setLyricsEditorMode('text')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              lyricsEditorMode === 'text'
                                ? 'bg-white/[0.1] border-white/20 text-white'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                          >
                            Paste / Edit LRC
                          </button>
                          <button
                            onClick={handleSwitchToTapMode}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              lyricsEditorMode === 'tap'
                                ? 'bg-white/[0.1] border-white/20 text-white'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                          >
                            Live Tap-to-Sync
                          </button>
                        </div>

                        <button
                          onClick={handleSaveLyricsDraft}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#090B10]"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <Check className="w-3.5 h-3.5" /> Save Lyrics
                        </button>
                      </div>

                      {lyricsEditorMode === 'text' ? (
                        <textarea
                          value={lyricsDraftText}
                          onChange={(e) => setLyricsDraftText(e.target.value)}
                          placeholder="Paste plain lyrics (one line per lyric) or timed LRC text like:&#10;[00:02.50] First line of the song&#10;[00:06.10] Second line of the song"
                          className="flex-1 w-full p-3.5 rounded-2xl bg-[#090B10]/90 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/25 resize-none leading-relaxed"
                        />
                      ) : (
                        <div className="flex-1 flex flex-col gap-3 min-h-0">
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#090B10]/80 border border-white/10">
                            <div className="text-xs text-slate-300">
                              Play the song and tap <span className="font-semibold text-white">Stamp Line</span> (or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd>) as each line starts.
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setTapSyncIndex((i) => Math.max(0, i - 1))}
                                disabled={tapSyncIndex === 0}
                                className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 bg-white/[0.06] disabled:opacity-30"
                              >
                                Undo
                              </button>
                              <button
                                onClick={handleStampTapLine}
                                disabled={tapSyncIndex >= tapSyncLines.length}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#090B10] disabled:opacity-40"
                                style={{ backgroundColor: theme.accent }}
                              >
                                Stamp Line {formatLrcTimestamp(currentTime)}
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                            {tapSyncLines.length === 0 ? (
                              <div className="py-12 text-center text-xs text-slate-500">
                                Switch to "Paste / Edit LRC" first and paste your lyrics lines to begin Tap-to-Sync.
                              </div>
                            ) : (
                              tapSyncLines.map((line, idx) => {
                                const isTarget = idx === tapSyncIndex;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setTapSyncIndex(idx)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer text-xs ${
                                      isTarget
                                        ? 'bg-white/[0.1] border-white/25 text-white'
                                        : 'bg-[#090B10]/40 border-white/[0.05] text-slate-300'
                                    }`}
                                    style={isTarget ? { borderColor: theme.accent } : {}}
                                  >
                                    <span
                                      className="font-mono text-[11px] w-20 shrink-0"
                                      style={{ color: line.time !== null ? theme.accent : '#64748B' }}
                                    >
                                      {line.time !== null ? formatLrcTimestamp(line.time) : '[--:--.--]'}
                                    </span>
                                    <span className="truncate">{line.text}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : currentParsedLyrics.lines.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-3">
                      <FileText className="w-10 h-10 text-slate-600" />
                      <h3 className="text-sm font-semibold text-white">No Lyrics Attached Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Attach a local <span className="font-mono text-slate-200">.lrc</span> file, paste lyrics, or use the built-in Live Tap-to-Sync editor to time-sync this song offline.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                        <button
                          onClick={() => lrcInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <Upload className="w-3.5 h-3.5" /> Attach .LRC File
                        </button>
                        <button
                          onClick={handleOpenLyricsEditor}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/10"
                        >
                          <PenLine className="w-3.5 h-3.5" /> Paste / Tap-to-Sync
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Live Synchronized Lyrics Stage */
                    <div className="flex-1 overflow-y-auto py-10 px-2 sm:px-4 space-y-4 scroll-smooth">
                      {currentParsedLyrics.lines.map((line, idx) => {
                        const isActive = currentParsedLyrics.isSynced && idx === activeLyricIndex;
                        const isPast = currentParsedLyrics.isSynced && idx < activeLyricIndex;
                        return (
                          <button
                            key={`${idx}-${line.time}`}
                            ref={isActive ? activeLyricRef : null}
                            onClick={() => {
                              if (currentParsedLyrics.isSynced && line.time !== null) {
                                handleSeek(Math.max(0, line.time - effectiveLyricsOffsetSec));
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-colors duration-200 block ${
                              currentParsedLyrics.isSynced ? 'cursor-pointer hover:bg-white/[0.04]' : 'cursor-default'
                            } ${isActive ? 'bg-white/[0.08] border-l-2 border-slate-100' : ''}`}
                          >
                            <div className="flex items-baseline gap-3">
                              {currentParsedLyrics.isSynced && (
                                <span
                                  className="text-[10px] font-mono shrink-0 transition-opacity"
                                  style={{
                                    color: isActive ? theme.accent : '#64748B',
                                    opacity: isActive ? 1 : 0.45,
                                  }}
                                >
                                  {formatDuration(line.time)}
                                </span>
                              )}
                              <span
                                className={`leading-snug transition-all duration-300 ${
                                  isActive
                                    ? 'text-xl sm:text-2xl font-semibold text-white'
                                    : isPast
                                    ? 'text-base sm:text-lg font-medium text-slate-500'
                                    : 'text-base sm:text-lg font-medium text-slate-400/80'
                                }`}
                              >
                                {line.text}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* UP NEXT TAB */}
              {expandedRightTab === 'queue' && (
                <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 pr-1">
                  {queue.map((id, idx) => {
                    const t = trackMap.get(id);
                    if (!t) return null;
                    const active = id === currentTrackId;
                    return (
                      <div
                        key={`exp-${id}-${idx}`}
                        onClick={() => playTrack(t.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                          active ? 'bg-white/[0.1]' : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <img src={t.artwork} alt={t.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold truncate"
                            style={active ? { color: theme.accent } : { color: '#F8FAFC' }}
                          >
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatDuration(t.duration)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 18. MODALS & TOASTS                                                    */}
      {/* ====================================================================== */}

      {/* Quick Tag Editor Modal */}
      {tagEditorTrackId &&
        (() => {
          const targetTrack = trackMap.get(tagEditorTrackId);
          if (!targetTrack) return null;
          const currentTags = getTrackTags(targetTrack);
          const q = tagInputValue.trim().toLowerCase();
          const autocompleteTags = allTags
            .map((t) => t.name)
            .filter(
              (name) =>
                (!q || name.toLowerCase().includes(q)) &&
                !currentTags.some((ct) => ct.toLowerCase() === name.toLowerCase())
            )
            .slice(0, 6);

          return (
            <div
              onClick={() => setTagEditorTrackId(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-[#171B26] border border-white/10 p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={targetTrack.artwork}
                      alt={targetTrack.title}
                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        Tags for {targetTrack.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{targetTrack.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTagEditorTrackId(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current Tags */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Active Tags</p>
                  {currentTags.length === 0 ? (
                    <p className="text-xs text-slate-500">No tags assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.08] text-white border border-white/10"
                        >
                          <button
                            onClick={() => {
                              setTagEditorTrackId(null);
                              navigateToTag(tag);
                            }}
                            className="hover:underline"
                          >
                            #{tag}
                          </button>
                          <button
                            onClick={() => removeTagFromTrack(targetTrack, tag)}
                            className="text-slate-400 hover:text-rose-400"
                            title={`Remove #${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Custom Tag Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={tagInputValue}
                      onChange={(e) => setTagInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInputValue.trim()) {
                          addTagToTrack(targetTrack, tagInputValue);
                          setTagInputValue('');
                        }
                      }}
                      placeholder="Add custom tag (e.g. Late Night, Study)..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={() => {
                        if (tagInputValue.trim()) {
                          addTagToTrack(targetTrack, tagInputValue);
                          setTagInputValue('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                      style={{ backgroundColor: theme.accent }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Autocomplete from Existing Library Tags */}
                  {autocompleteTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {autocompleteTags.map((name) => (
                        <button
                          key={`ac-${name}`}
                          onClick={() => {
                            addTagToTrack(targetTrack, name);
                            setTagInputValue('');
                          }}
                          className="px-2 py-0.5 rounded-full text-[11px] bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]"
                        >
                          + #{name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Mood / Context Presets */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    Quick Mood & Context Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TAGS.map((preset) => {
                      const alreadyAdded = currentTags.some(
                        (t) => t.toLowerCase() === preset.toLowerCase()
                      );
                      return (
                        <button
                          key={preset}
                          onClick={() =>
                            alreadyAdded
                              ? removeTagFromTrack(targetTrack, preset)
                              : addTagToTrack(targetTrack, preset)
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                            alreadyAdded
                              ? 'text-[#090B10] border-transparent font-semibold'
                              : 'bg-[#090B10]/70 hover:bg-white/[0.08] text-slate-300 border-white/10'
                          }`}
                          style={alreadyAdded ? { backgroundColor: theme.accent } : {}}
                        >
                          {alreadyAdded ? '✓ ' : '+ '}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Create / Rename Playlist Modal */}
      {playlistModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#171B26] border border-white/10 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {playlistModal.mode === 'create' ? 'Create New Playlist' : 'Rename Playlist'}
            </h3>
            <input
              type="text"
              autoFocus
              value={playlistModal.name}
              onChange={(e) => setPlaylistModal((m) => ({ ...m, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePlaylistModal()}
              placeholder="e.g., Late Night Focus"
              className="w-full px-4 py-2.5 rounded-xl bg-[#090B10] border border-white/15 text-sm text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPlaylistModal({ open: false, mode: 'create', playlistId: null, name: '' })}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlaylistModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                style={{ backgroundColor: theme.accent }}
              >
                {playlistModal.mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Track to Playlist Modal */}
      {addToPlaylistTrack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#171B26] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add to Playlist</h3>
              <button
                onClick={() => setAddToPlaylistTrack(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Track: <span className="text-white">{addToPlaylistTrack.title}</span>
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <button
                  onClick={() => {
                    setAddToPlaylistTrack(null);
                    setPlaylistModal({ open: true, mode: 'create', playlistId: null, name: '' });
                  }}
                  className="w-full py-3 rounded-xl text-xs font-semibold text-[#090B10]"
                  style={{ backgroundColor: theme.accent }}
                >
                  + Create Your First Playlist
                </button>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => addTrackToPlaylist(pl.id, addToPlaylistTrack.id)}
                    className="w-full p-3 rounded-xl bg-[#090B10]/70 hover:bg-white/[0.07] border border-white/[0.07] text-left flex items-center justify-between"
                  >
                    <span className="text-sm text-white truncate">{pl.name}</span>
                    <Plus className="w-4 h-4 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Replaces alert/confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#171B26] border border-white/10 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">{confirmModal.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  confirmModal.danger ? 'bg-rose-500 text-white' : 'text-[#090B10]'
                }`}
                style={!confirmModal.danger ? { backgroundColor: theme.accent } : {}}
              >
                {confirmModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Connector Architecture Modal */}
      {connectorInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#171B26] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{connectorInfoModal.name}</h3>
              <button
                onClick={() => setConnectorInfoModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              Backend OAuth Required — Offline Mode Active
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {connectorInfoModal.description}
            </p>
            <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/[0.07] space-y-1.5 text-[11px] text-slate-400">
              <p className="text-slate-200 font-medium">Security Architecture:</p>
              <p>• Cloud Sound Studio never hardcodes or exposes private OAuth client secrets in frontend code.</p>
              <p>• Connecting {connectorInfoModal.name} requires a backend token-exchange proxy supporting HTTP Range streaming ({connectorInfoModal.protocol}).</p>
              <p>• In this standalone offline build, Local Storage indexing is 100% active and private.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setConnectorInfoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#090B10]"
                style={{ backgroundColor: theme.accent }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio About & Engineering Architecture Modal */}
      {showAboutModal && (
        <div
          onClick={() => setShowAboutModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#13151A] border border-white/10 p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B0C0F] flex items-center justify-center shrink-0">
                  <AudioLines className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Cloud Sound Studio</h3>
                  <p className="text-xs text-slate-400">
                    Offline-First Universal Personal Music Platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Built as a zero-backend, privacy-first personal music studio. Visitors can immediately test playback with 6 synthesized stereo WAV demo tracks (badged <span className="font-mono text-amber-300">DEMO</span>) or drag-and-drop their own local music folders and <span className="font-mono text-slate-200">.lrc</span> files directly into the browser.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Cpu className="w-3.5 h-3.5 text-slate-300" /> Binary ID3v2 Engine
                </div>
                <p className="text-[11px] text-slate-400">
                  Browser-side parser for TIT2, TPE1, TALB, TCON, APIC cover art, and USLT/SYLT lyrics.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Mic2 className="w-3.5 h-3.5 text-slate-300" /> Synced Lyrics & Tap-Sync
                </div>
                <p className="text-[11px] text-slate-400">
                  Full LRC parser, click-to-seek, timing offset nudging, live Tap-to-Sync, and .lrc export.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Layers className="w-3.5 h-3.5 text-slate-300" /> Modular Storage Design
                </div>
                <p className="text-[11px] text-slate-400">
                  Active File System Access API + Drag-and-Drop alongside OAuth-ready cloud connector specs.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> 100% Client-Side Privacy
                </div>
                <p className="text-[11px] text-slate-400">
                  Audio files never leave the device; playlists, tags, and lyrics persist locally.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
              <button
                onClick={handleSharePortfolioLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#1B1E26] hover:bg-[#232732] border border-white/[0.08]"
              >
                <Share2 className="w-3.5 h-3.5" /> Copy Live Link
              </button>
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0B0C0F] bg-slate-100 hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium flex items-center justify-between gap-3 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : 'bg-[#171B26]/95 border-white/15 text-slate-100'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="opacity-70 hover:opacity-100 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 19. PRODUCTION ERROR BOUNDARY WRAPPER
// ============================================================================

class StudioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected audio engine error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0B0C0F] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#13151A] border border-white/10 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h1 className="text-lg font-semibold text-white">Cloud Sound Studio Recovery</h1>
            <p className="text-xs text-slate-400 leading-relaxed">{this.state.errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#0B0C0F] bg-slate-100 hover:bg-white transition-colors"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <StudioErrorBoundary>
      <CloudSoundStudioApp />
    </StudioErrorBoundary>
  );
}