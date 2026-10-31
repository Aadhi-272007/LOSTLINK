import { useCallback, useEffect, useState } from "react";

/**
 * Fetch JSON from one of the board's data routes.
 * state: "loading" | "ready" | "missing" | "error"
 */
export default function useJson(url) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(url)
      .then((response) => {
        if (response.status === 404) return { missing: true };
        if (!response.ok) return Promise.reject(new Error(`Request failed: ${response.status}`));
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        if (payload?.missing) {
          setState("missing");
          return;
        }
        setData(payload);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  return { data, state, reload };
}