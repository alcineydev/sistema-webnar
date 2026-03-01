"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKey?: keyof T
  pageSize?: number
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Buscar...",
  searchKey,
  pageSize = 10,
  onRowClick,
  emptyMessage = "Nenhum item encontrado",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchable || !searchKey) return data

    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return data

    return data.filter((item) => {
      const value = item[searchKey]
      if (typeof value === "string") {
        return value.toLowerCase().includes(normalizedSearch)
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value).toLowerCase().includes(normalizedSearch)
      }
      if (value && typeof value === "object") {
        return JSON.stringify(value).toLowerCase().includes(normalizedSearch)
      }
      return true
    })
  }, [data, searchable, searchKey, search])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {searchable ? (
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-slate-600 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-slate-100 last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                      {col.render
                        ? col.render(item)
                        : (item[col.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <span className="text-sm text-slate-500">
            Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} de{" "}
            {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="rounded-lg p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
