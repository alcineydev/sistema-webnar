"use client"

import { useEffect, useRef } from "react"
import { defaultLoginBgCode } from "@/lib/default-login-bg"

interface LoginBackgroundProps {
  type: string | null
  imageUrl: string | null
  code: string | null
}

export function LoginBackground({ type, imageUrl, code }: LoginBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  void code

  useEffect(() => {
    if (type === "code" && containerRef.current) {
      // Security hardening: do not execute arbitrary HTML/JS from database.
      containerRef.current.innerHTML = defaultLoginBgCode
    }
  }, [type])

  if (type === "image" && imageUrl) {
    return (
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
    )
  }

  if (type === "gif" && imageUrl) {
    return (
      <div className="fixed inset-0 z-0">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    )
  }

  return <div ref={containerRef} className="fixed inset-0 z-0" />
}
