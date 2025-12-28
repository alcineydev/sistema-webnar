import { z } from "zod"

export const createWebinarSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  releaseType: z.enum(["IMMEDIATE", "SCHEDULED", "SEQUENTIAL"]).default("IMMEDIATE"),
  primaryColor: z.string().optional().default("#6366f1"),
  offerUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  offerButtonText: z.string().optional().default("Quero Aproveitar"),
  urgencyMessage: z.string().optional(),
})

export const updateWebinarSchema = createWebinarSchema.partial()

export const createLessonSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().optional(),
  videoUrl: z.string().url("URL do vídeo inválida"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  releaseAt: z.date().optional().nullable(),
  offerShowAt: z.number().int().min(0).optional().nullable(),
})

export const updateLessonSchema = createLessonSchema.partial()

export type CreateWebinarInput = z.infer<typeof createWebinarSchema>
export type UpdateWebinarInput = z.infer<typeof updateWebinarSchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
