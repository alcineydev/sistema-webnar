// Minimal sanitization to reduce stored XSS risk when rendering HTML from database.
export function sanitizeRichTextHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\{[^}]*\}/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
}
