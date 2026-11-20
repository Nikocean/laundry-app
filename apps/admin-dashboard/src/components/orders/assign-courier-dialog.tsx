"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { AvailableCourier } from "@/lib/couriers/types";
import type { Order } from "@/lib/orders/types";
import { shortId } from "@/lib/orders/format";

type AssignCourierDialogProps = {
  order: Order;
  open: boolean;
  onClose: () => void;
  onAssigned: (order: Order) => void;
};

export function AssignCourierDialog({
  order,
  open,
  onClose,
  onAssigned,
}: AssignCourierDialogProps) {
  const [couriers, setCouriers] = useState<AvailableCourier[]>([]);
  const [courierUserId, setCourierUserId] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCouriers() {
      setLoadingList(true);
      setError(null);
      setCourierUserId("");
      try {
        const res = await fetch("/api/couriers?available=true", {
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(
              (body as { message?: string }).message ??
                "Failed to load available couriers"
            );
            setCouriers([]);
          }
          return;
        }
        if (!cancelled) {
          setCouriers(body as AvailableCourier[]);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to reach courier list");
          setCouriers([]);
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }

    void loadCouriers();
    return () => {
      cancelled = true;
    };
  }, [open, order.id]);

  if (!open) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!courierUserId) {
      setError("Select an available courier");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courierId: courierUserId }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (body as { message?: string }).message ??
            `Assign failed (${res.status})`
        );
        return;
      }

      onAssigned(body as Order);
      onClose();
    } catch {
      setError("Unable to assign courier");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-courier-title"
      data-testid="assign-dialog"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle id="assign-courier-title">Assign courier</CardTitle>
          <CardDescription>
            Order <span className="font-mono">{shortId(order.id)}</span> — only
            available couriers are listed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courier-select">Courier</Label>
              <select
                id="courier-select"
                data-testid="assign-courier-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={courierUserId}
                disabled={loadingList || submitting}
                onChange={(e) => setCourierUserId(e.target.value)}
              >
                <option value="">
                  {loadingList ? "Loading…" : "Select courier"}
                </option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.user.id}>
                    {courier.user.name} ({courier.user.email})
                  </option>
                ))}
              </select>
              {!loadingList && couriers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No available couriers right now.
                </p>
              ) : null}
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="assign-submit"
                disabled={submitting || loadingList || !courierUserId}
              >
                {submitting ? "Assigning…" : "Assign"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
