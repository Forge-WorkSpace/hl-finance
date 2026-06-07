import { redirect } from "next/navigation";
import { withToastParam, type ToastKey } from "@/lib/toast-messages";

export function redirectWithToast(path: string, toast: ToastKey): never {
  redirect(withToastParam(path, toast));
}
