import { useEffect, useState } from "react";
import type { SuApiResponse } from "@/services/su/client";

export function useSuData<T>(fetcher: () => Promise<SuApiResponse<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<SuApiResponse<T>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((r) => {
        setData(r.data);
        setMeta(r.meta);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  return { data, meta, loading, error, reload };
}
