"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { AssignCourierDialog } from "@/components/orders/assign-courier-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { formatOrderDate, formatRupiah, shortId } from "@/lib/orders/format";
import {
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/lib/orders/types";

type OrdersTableProps = {
  initialOrders: Order[];
};

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const { orders, setOrders, socketState, socketError } =
    useOrdersRealtime(initialOrders);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-mono text-xs" title={row.original.id}>
            {shortId(row.original.id)}
          </span>
        ),
      },
      {
        id: "customerName",
        accessorFn: (row) => row.customerId,
        header: "Customer",
        cell: ({ row }) => (
          <span className="font-mono text-xs" title={row.original.customerId}>
            {shortId(row.original.customerId)}
          </span>
        ),
        filterFn: (row, _id, filterValue) => {
          const q = String(filterValue ?? "")
            .trim()
            .toLowerCase();
          if (!q) return true;
          return row.original.customerId.toLowerCase().includes(q);
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
            {row.original.status.replaceAll("_", " ")}
          </span>
        ),
        filterFn: (row, _id, filterValue) => {
          const status = String(filterValue ?? "");
          if (!status || status === "all") return true;
          return row.original.status === status;
        },
      },
      {
        accessorKey: "courierId",
        header: "Courier",
        cell: ({ row }) =>
          row.original.courierId ? (
            <span className="font-mono text-xs" title={row.original.courierId}>
              {shortId(row.original.courierId)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total",
        cell: ({ row }) => formatRupiah(row.original.totalPrice),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.paymentStatus}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatOrderDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.status !== "pending") {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid={`order-assign-${row.original.id}`}
              onClick={() => setAssignOrder(row.original)}
            >
              Assign
            </Button>
          );
        },
      },
    ],
    []
  );

  const data = useMemo(() => orders, [orders]);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function onStatusChange(value: string) {
    setStatusFilter(value);
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== "status");
      if (!value || value === "all") return rest;
      return [...rest, { id: "status", value }];
    });
  }

  function onCustomerChange(value: string) {
    setCustomerFilter(value);
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== "customerName");
      if (!value.trim()) return rest;
      return [...rest, { id: "customerName", value }];
    });
  }

  function onAssigned(updated: Order) {
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.id === updated.id);
      if (index === -1) return prev;
      const copy = prev.slice();
      copy[index] = { ...prev[index], ...updated };
      return copy;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <select
            id="status-filter"
            data-testid="orders-status-filter"
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status: OrderStatus) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-filter">Customer name</Label>
          <Input
            id="customer-filter"
            data-testid="orders-customer-filter"
            className="w-64"
            placeholder="Filter by customer ID…"
            value={customerFilter}
            onChange={(e) => onCustomerChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Backend list payload has <code>customerId</code> only (no name yet).
          </p>
        </div>
        <div
          className="ml-auto text-sm text-muted-foreground"
          data-testid="orders-socket-state"
        >
          Live:{" "}
          <span
            className={
              socketState === "connected"
                ? "text-emerald-700"
                : socketState === "error"
                  ? "text-destructive"
                  : ""
            }
          >
            {socketState}
            {socketError ? ` — ${socketError}` : ""}
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`order-row-${row.original.id}`}
                  data-status={row.original.status}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {assignOrder ? (
        <AssignCourierDialog
          order={assignOrder}
          open={Boolean(assignOrder)}
          onClose={() => setAssignOrder(null)}
          onAssigned={onAssigned}
        />
      ) : null}
    </div>
  );
}
