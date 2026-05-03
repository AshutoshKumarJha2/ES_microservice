import { useCallback, useEffect, useRef, useState } from 'react'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  totalPages: number
  totalElements: number
  loading: boolean
  setPage: (p: number) => void
  refetch: () => void
}

interface UsePaginatedQueryOptions<P extends object> {
  /** Service function. Receives merged params + page + size. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher: (p: P & { page: number; size: number }) => Promise<any>
  /** Key in the response object that holds the items array, e.g. "events", "registrations" */
  itemsKey: string
  /** Filter / search params — any deep change triggers debounce → reset to page 0 */
  params: P
  size?: number       // default 20
  debounceMs?: number // default 300
}

/**
 * Generic server-side paginated query hook.
 * Handles debounce, page-reset on filter change, stale-response deduplication,
 * and React StrictMode (cleanup cancels the in-flight response).
 */
export function usePaginatedQuery<T, P extends object>({
  fetcher,
  itemsKey,
  params,
  size = 20,
  debounceMs = 300,
}: UsePaginatedQueryOptions<P>): PaginatedResult<T> {
  const [data, setData]           = useState<T[]>([])
  const [page, setPageState]      = useState(0)
  const [totalPages, setTotalPgs] = useState(1)
  const [totalElements, setTotal] = useState(0)
  const [loading, setLoading]     = useState(true)

  // Always-current refs so callbacks never go stale
  const fetcherRef = useRef(fetcher)
  const paramsRef  = useRef(params)
  const pageRef    = useRef(0)
  const reqIdRef   = useRef(0)   // incremented on each request; used to drop stale responses

  fetcherRef.current = fetcher
  paramsRef.current  = params
  pageRef.current    = page

  const execute = useCallback((p: number) => {
    const reqId = ++reqIdRef.current
    setLoading(true)
    fetcherRef.current({ ...(paramsRef.current as object), page: p, size } as P & { page: number; size: number })
      .then((res) => {
        if (reqId !== reqIdRef.current) return  // stale response — ignore
        setData((res[itemsKey] as T[]) ?? [])
        setTotalPgs((res.totalPages as number) ?? 1)
        setTotal((res.totalElements as number) ?? 0)
      })
      .catch(() => {
        if (reqId !== reqIdRef.current) return
        setData([]); setTotalPgs(1); setTotal(0)
      })
      .finally(() => { if (reqId === reqIdRef.current) setLoading(false) })
  }, [itemsKey, size])

  // Params change → debounce → reset page to 0
  // JSON.stringify for deep comparison; cleanup cancels timer (handles StrictMode double-invoke)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const serialized = JSON.stringify(params)
  useEffect(() => {
    setPageState(0)
    const timer = setTimeout(() => execute(0), debounceMs)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, debounceMs, execute])

  const setPage = useCallback((p: number) => {
    setPageState(p)
    execute(p)
  }, [execute])

  const refetch = useCallback(() => execute(pageRef.current), [execute])

  return { data, page, totalPages, totalElements, loading, setPage, refetch }
}
