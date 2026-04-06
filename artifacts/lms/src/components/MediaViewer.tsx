import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  SkipBack, SkipForward, Download, X, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';

export type MediaType = 'pdf' | 'audiobook' | 'video' | 'research_paper' | 'article' | 'e-document';

interface MediaViewerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  author: string;
  type: MediaType;
  /** URL to the media file. Falls back to demo content if not provided. */
  url?: string;
  /** Whether the user has access (approved borrow / open resource) */
  canAccess?: boolean;
  onRequestAccess?: () => void;
}

// ── Demo fallback URLs (public domain / sample files) ─────────────────────────
const DEMO: Record<MediaType, string> = {
  pdf:            'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
  research_paper: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
  article:        'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
  'e-document':   'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
  audiobook:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  video:          'https://www.w3.org/2010/05/video/mediaevents.html',
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MediaViewer({
  open, onClose, title, author, type, url, canAccess = true, onRequestAccess,
}: MediaViewerProps) {
  const src = url || DEMO[type] || DEMO.pdf;
  const isPdf  = ['pdf', 'research_paper', 'article', 'e-document'].includes(type);
  const isAudio = type === 'audiobook';
  const isVideo = type === 'video';

  // ── Audio / Video state ───────────────────────────────────────────────────
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const [playing, setPlaying]     = useState(false);
  const [muted, setMuted]         = useState(false);
  const [volume, setVolume]       = useState(1);
  const [current, setCurrent]     = useState(0);
  const [duration, setDuration]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!open) {
      mediaRef.current?.pause();
      setPlaying(false);
      setCurrent(0);
      setLoading(true);
    }
  }, [open]);

  const togglePlay = () => {
    const m = mediaRef.current;
    if (!m) return;
    if (playing) { m.pause(); setPlaying(false); }
    else { m.play(); setPlaying(true); }
  };

  const seek = (val: number[]) => {
    const m = mediaRef.current;
    if (!m) return;
    m.currentTime = val[0];
    setCurrent(val[0]);
  };

  const changeVolume = (val: number[]) => {
    const m = mediaRef.current;
    if (!m) return;
    m.volume = val[0];
    setVolume(val[0]);
    setMuted(val[0] === 0);
  };

  const skip = (secs: number) => {
    const m = mediaRef.current;
    if (!m) return;
    m.currentTime = Math.max(0, Math.min(duration, m.currentTime + secs));
  };

  const toggleMute = () => {
    const m = mediaRef.current;
    if (!m) return;
    m.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('lms-video-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-4xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight truncate">{title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{author}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" asChild>
                <a href={src} download target="_blank" rel="noopener noreferrer">
                  <Download size={14} className="mr-1" /> Download
                </a>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {!canAccess ? (
            /* ── Access gate ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Download size={28} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Access Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You need to request and get approval to read this resource.
                </p>
              </div>
              {onRequestAccess && (
                <Button onClick={onRequestAccess} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Request Access
                </Button>
              )}
            </div>

          ) : isPdf ? (
            /* ── PDF / Document viewer ── */
            <div className="flex-1 flex flex-col min-h-0">
              <iframe
                src={`${src}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="flex-1 w-full border-0"
                title={title}
                style={{ minHeight: '60vh' }}
                onLoad={() => setLoading(false)}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-sm text-muted-foreground animate-pulse">Loading document…</div>
                </div>
              )}
            </div>

          ) : isAudio ? (
            /* ── Audio player (Kindle-style with cover art) ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-secondary/30 to-background">
              {/* Cover art placeholder */}
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
                <div className="text-center text-primary-foreground px-4">
                  <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Audiobook</p>
                  <p className="font-bold text-sm leading-tight">{title}</p>
                  <p className="text-xs opacity-60 mt-1">{author}</p>
                </div>
              </div>

              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={src}
                onTimeUpdate={() => setCurrent(mediaRef.current?.currentTime ?? 0)}
                onDurationChange={() => setDuration(mediaRef.current?.duration ?? 0)}
                onEnded={() => setPlaying(false)}
                onCanPlay={() => setLoading(false)}
                className="hidden"
              />

              {/* Progress */}
              <div className="w-full max-w-sm space-y-1">
                <Slider
                  value={[current]}
                  max={duration || 100}
                  step={1}
                  onValueChange={seek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(current)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" onClick={() => skip(-15)}>
                  <SkipBack size={20} />
                </Button>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                  onClick={togglePlay}
                  disabled={loading}
                >
                  {loading ? (
                    <RotateCcw size={22} className="animate-spin" />
                  ) : playing ? (
                    <Pause size={22} />
                  ) : (
                    <Play size={22} />
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => skip(15)}>
                  <SkipForward size={20} />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 w-full max-w-xs">
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={toggleMute}>
                  {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={changeVolume}
                  className="flex-1"
                />
              </div>
            </div>

          ) : isVideo ? (
            /* ── Video player ── */
            <div id="lms-video-container" className="flex-1 flex flex-col bg-black min-h-0">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={src}
                className="flex-1 w-full object-contain"
                onTimeUpdate={() => setCurrent(mediaRef.current?.currentTime ?? 0)}
                onDurationChange={() => setDuration(mediaRef.current?.duration ?? 0)}
                onEnded={() => setPlaying(false)}
                onCanPlay={() => setLoading(false)}
                onClick={togglePlay}
              />

              {/* Video controls bar */}
              <div className="bg-black/90 px-4 py-3 space-y-2">
                <Slider
                  value={[current]}
                  max={duration || 100}
                  step={1}
                  onValueChange={seek}
                  className="w-full"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-white hover:bg-white/20" onClick={() => skip(-10)}>
                      <SkipBack size={16} />
                    </Button>
                    <Button size="icon" className="h-9 w-9 bg-white text-black hover:bg-white/90" onClick={togglePlay} disabled={loading}>
                      {loading ? <RotateCcw size={16} className="animate-spin" /> : playing ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-white hover:bg-white/20" onClick={() => skip(10)}>
                      <SkipForward size={16} />
                    </Button>
                    <span className="text-white text-xs">{fmt(current)} / {fmt(duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-white hover:bg-white/20" onClick={toggleMute}>
                      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </Button>
                    <Slider
                      value={[muted ? 0 : volume]}
                      max={1}
                      step={0.05}
                      onValueChange={changeVolume}
                      className="w-24"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-white hover:bg-white/20" onClick={toggleFullscreen}>
                      {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
