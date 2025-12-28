"use client"

import { useState, useRef } from "react"
import { X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  folder?: string
}

export function ImageUpload({ value, onChange, folder = "thumbnails" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.url) {
        onChange(data.url)
        setPreview(data.url)
      } else {
        console.error("Upload failed:", data.error)
        setPreview(value || null)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setPreview(value || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="thumbnail-upload"
      />

      {preview ? (
        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-slate-200">
          <img src={preview} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trocar"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-500"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Clique para fazer upload</span>
              <span className="text-xs">PNG, JPG até 5MB</span>
            </>
          )}
        </button>
      )}

      {/* Campo hidden para o form */}
      <input type="hidden" name="thumbnailUrl" value={preview || ""} />
    </div>
  )
}
