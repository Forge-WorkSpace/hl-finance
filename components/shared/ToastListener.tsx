"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TOAST_MESSAGES, type ToastKey } from "@/lib/toast-messages";

function ToastListenerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const key = searchParams.get("toast") as ToastKey | null;
    if (!key || !(key in TOAST_MESSAGES)) return;

    toast.success(TOAST_MESSAGES[key]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [searchParams, router, pathname]);

  return null;
}

export function ToastListener() {
  return (
    <Suspense fallback={null}>
      <ToastListenerInner />
    </Suspense>
  );
}
