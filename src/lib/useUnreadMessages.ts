import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import { getSelfUnreadCount, getUnreadCount } from "@/lib/messages";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadMessages(role: "nutritionist" | "client") {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      const token = getStoredToken();
      if (!token) return;
      try {
        const { count: c } = role === "nutritionist"
          ? await getUnreadCount(token)
          : await getSelfUnreadCount(token);
        if (!cancelled) setCount(c);
      } catch {
        // silencioso: badge não é crítico
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [role]);

  return count;
}
