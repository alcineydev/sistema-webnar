"use client"

import { useState, useRef } from "react"
import { X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  folder?: string
}

// Cliente Supabase no lado do cliente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function ImageUpload({ value, onChange, folder = "thumbnails" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WebP.")
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB.")
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload direto para Supabase
    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from("webinar-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        setError(`Erro no upload: ${uploadError.message}`)
        setPreview(value || null)
        return
      }

      // Gerar URL pública
      const { data: urlData } = supabase.storage
        .from("webinar-assets")
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
      setPreview(urlData.publicUrl)
    } catch (err) {
      console.error("Upload error:", err)
      setError("Erro ao fazer upload. Tente novamente.")
      setPreview(value || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
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

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

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
