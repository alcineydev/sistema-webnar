"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2
} from "lucide-react"

interface YTPlayer {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getPlayerState: () => number
}

interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

interface YTPlayerConfig {
  videoId: string
  playerVars: {
    autoplay: number
    controls: number
    rel: number
    modestbranding: number
    playsinline: number
  }
  events: {
    onReady: (event: YTPlayerEvent) => void
    onStateChange: (event: YTPlayerEvent) => void
  }
}

interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer
  PlayerState: {
    PLAYING: number
    PAUSED: number
    ENDED: number
  }
}

declare global {
  interface Window {
    YT: YT
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayerProps {
  videoUrl: string
  primaryColor?: string
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: (currentTime: number) => void
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function YouTubePlayer({
  videoUrl,
  primaryColor = "#6366f1",
  onEnded,
  onTimeUpdate,
  onPlay,
  onPause
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playerContainerId] = useState(() => `yt-player-${Math.random().toString(36).substr(2, 9)}`)

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [apiLoaded, setApiLoaded] = useState(false)

  const videoId = extractVideoId(videoUrl)

  // Carregar API do YouTube
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (existingScript) {
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiLoaded(true)
          clearInterval(checkYT)
        }
      }, 100)
      return () => clearInterval(checkYT)
    }

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true)
    }
  }, [])

  // Criar player quando API carrega ou videoId muda
  useEffect(() => {
    if (!apiLoaded || !videoId) return

    // Destruir player existente
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    // Reset states
    setIsReady(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    // Criar novo player
    playerRef.current = new window.YT.Player(playerContainerId, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event: YTPlayerEvent) => {
          setIsReady(true)
          setDuration(event.target.getDuration())
        },
        onStateChange: (event: YTPlayerEvent) => {
          const state = event.data

          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
            if (onPlay) onPlay()
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
            if (onPause && playerRef.current) {
              onPause(playerRef.current.getCurrentTime())
            }
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false)
            if (onEnded) onEnded()
          }
        }
      }
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [apiLoaded, videoId, playerContainerId, onEnded, onPlay, onPause])

  // Atualizar tempo atual
  useEffect(() => {
    if (!isReady || !isPlaying) return

    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime()
        const dur = playerRef.current.getDuration()
        setCurrentTime(time)

        if (dur > 0) {
          setDuration(dur)
          if (onTimeUpdate) {
            onTimeUpdate(time, dur)
          }
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isReady, isPlaying, onTimeUpdate])

  // Auto-hide controles
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      return
    }

    const timeout = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }, [isMuted])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    playerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }, [duration])

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Player container */}
      <div id={playerContainerId} className="absolute inset-0 w-full h-full" />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: primaryColor }} />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Play button central */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!isPlaying && isReady && (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          )}
        </button>

        {/* Barra de controles inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Barra de progresso */}
          <div
            className="h-1 bg-zinc-600 rounded-full mb-3 cursor-pointer group/progress"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full relative"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:opacity-80 transition-opacity"
                style={{ "--hover-color": primaryColor } as React.CSSProperties}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:opacity-80 transition-opacity"
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button onClick={toggleFullscreen} className="text-white hover:opacity-80 transition-opacity">
              <Maximize className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
