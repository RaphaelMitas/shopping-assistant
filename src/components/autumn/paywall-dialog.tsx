"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useCustomer, usePaywall } from "autumn-js/react";
import { getPaywallContent } from "@/lib/autumn/paywall-content";
import { cn } from "@/lib/utils";
import CheckoutDialog from "./checkout-dialog";

export interface PaywallDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  featureId: string;
  entityId?: string;
}

export default function PaywallDialog(params?: PaywallDialogProps) {
  const { data: preview } = usePaywall({
    featureId: params?.featureId,
    entityId: params?.entityId,
  });
  const { customer, checkout } = useCustomer();

  if (!params || !preview) {
    return <></>;
  }

  const { open, setOpen } = params;
  const { title, message } = getPaywallContent(preview);

  const handleConfirm = () => {
    setOpen(false);

    const product = customer?.products.find(
      (product) =>
        product.id === "free" ||
        product.id === "starter" ||
        product.id === "premium",
    );
    if (product) {
      checkout({
        productId:
          product.id === "free"
            ? "starter"
            : product.id === "starter"
              ? "premium"
              : "top_up",
        dialog: CheckoutDialog,
      }).catch(() => {
        console.error("Error checking out");
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="text-foreground gap-0 overflow-hidden p-0 pt-4 text-sm">
        <DialogTitle className={cn("px-6 text-xl font-bold")}>
          {title}
        </DialogTitle>
        <div className="my-2 px-6">{message}</div>
        <DialogFooter className="bg-secondary mt-4 flex flex-row justify-between gap-x-4 border-t py-2 pr-3 pl-6 sm:flex-row">
          <Button
            size="sm"
            className="min-w-20 font-medium shadow transition"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
