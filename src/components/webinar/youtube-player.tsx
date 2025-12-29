"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"

interface YouTubePlayerProps {
  videoUrl: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onPlay?: () => void
  onPause?: () => void
  offerShowAt?: number | null
  onOfferShow?: () => void
}

interface YTPlayer {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
}

interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

interface YTPlayerState {
  PLAYING: number
  PAUSED: number
  ENDED: number
}

interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer
  PlayerState: YTPlayerState
}

interface YTPlayerConfig {
  videoId: string
  playerVars: {
    autoplay: number
    controls: number
    modestbranding: number
    rel: number
    showinfo: number
    fs: number
    playsinline: number
    disablekb: number
    iv_load_policy: number
  }
  events: {
    onReady: (event: YTPlayerEvent) => void
    onStateChange: (event: YTPlayerEvent) => void
  }
}

declare global {
  interface Window {
    YT: YT
    onYouTubeIframeAPIReady: () => void
  }
}

function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function YouTubePlayer({
  videoUrl,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  offerShowAt,
  onOfferShow
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(7)}`)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [offerShown, setOfferShown] = useState(false)
  const hideControlsTimeout = useRef<NodeJS.Timeout>()
  const [apiLoaded, setApiLoaded] = useState(false)

  const videoId = getYouTubeVideoId(videoUrl)

  // Carregar API do YouTube apenas uma vez
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiLoaded(true)
          clearInterval(checkReady)
        }
      }, 100)
      return () => clearInterval(checkReady)
    }

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true)
    }
  }, [])

  // Criar/recriar player quando API carrega ou videoId muda
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
    setOfferShown(false)

    // Criar novo player
    playerRef.current = new window.YT.Player(playerContainerId.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1,
        disablekb: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event: YTPlayerEvent) => {
          setIsReady(true)
          setDuration(event.target.getDuration())
        },
        onStateChange: (event: YTPlayerEvent) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
            onPlay?.()
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
            onPause?.()
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false)
            onEnded?.()
          }
        },
      },
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [apiLoaded, videoId, onEnded])

  // Atualizar tempo e verificar oferta
  useEffect(() => {
    if (!isReady || !isPlaying) return

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime()
        const dur = playerRef.current.getDuration() || duration
        setCurrentTime(time)
        onTimeUpdate?.(time, dur)

        if (offerShowAt && time >= offerShowAt && !offerShown) {
          setOfferShown(true)
          onOfferShow?.()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isReady, isPlaying, onTimeUpdate, offerShowAt, offerShown, onOfferShow])

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying])

  const handleMuteToggle = useCallback(() => {
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
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration
    playerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }, [duration])

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!videoId) {
    return (
      <div className="aspect-video bg-zinc-900 rounded-xl flex items-center justify-center">
        <p className="text-zinc-500">URL de vídeo inválida</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div id={playerContainerId.current} className="absolute inset-0 w-full h-full" />

      {/* Overlay para capturar cliques */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handlePlayPause}
      />

      {/* Loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controles customizados */}
      <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls && isReady ? "opacity-100" : "opacity-0"}`}>
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Botão de play central */}
        {!isPlaying && isReady && (
          <button
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Play className="h-10 w-10 ml-1" />
          </button>
        )}

        {/* Barra de controles inferior */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Barra de progresso */}
          <div
            className="h-1 bg-zinc-700 rounded-full cursor-pointer group/progress"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-indigo-600 rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>

              <span className="text-sm text-zinc-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                <Maximize className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
