"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { BonFormCustomer } from "@/lib/transactions/types";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";

interface CustomerComboboxProps {
  customers: BonFormCustomer[];
  value: string;
  onChange: (customerId: string) => void;
  disabled?: boolean;
}

export function CustomerCombobox({
  customers,
  value,
  onChange,
  disabled,
}: CustomerComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = customers.find((customer) => customer.id === value) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected?.nama ?? "");

  useEffect(() => {
    setQuery(selected?.nama ?? "");
  }, [selected?.id, selected?.nama]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery(selected?.nama ?? "");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected?.nama]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      customer.nama.toLowerCase().includes(q),
    );
  }, [customers, query]);

  function pickCustomer(customer: BonFormCustomer) {
    onChange(customer.id);
    setQuery(customer.nama);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          id="customer_id"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (selected && event.target.value !== selected.nama) {
              onChange("");
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Pilih pelanggan..."
          disabled={disabled}
          autoComplete="off"
          className="h-11 w-full rounded-md border border-[var(--border)] bg-white py-0 pr-10 pl-9 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-dim)] disabled:opacity-60"
          aria-label="Buka daftar pelanggan"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {open && !disabled ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[var(--border)] bg-white py-1 shadow-[var(--shadow-card)]"
        >
          {filteredCustomers.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--text-tertiary)]">
              Tidak ada pelanggan ditemukan
            </li>
          ) : (
            filteredCustomers.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={customer.id === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pickCustomer(customer)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[var(--surface-dim)] ${
                    customer.id === value
                      ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  <CustomerAvatar name={customer.nama} size={28} />
                  <span className="font-medium">{customer.nama}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
