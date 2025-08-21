import { useState, useCallback } from "react";

export type WaitlistStatus = "idle" | "success" | "error" | "duplicate";

export function useWaitlist() {
  const [status, setStatus] = useState<WaitlistStatus>("idle");

  const submit = useCallback(async (payload: Record<string, unknown>) => {
    try {
      setStatus("idle");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/waitlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409 && data?.detail === "Email already registered") {
          setStatus("duplicate");
          return;
        }
        throw new Error("Request failed");
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  return { submit, status };
}
