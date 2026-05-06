"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { EventCategory } from "@/lib/types/event";

export interface FilterValues {
  search?: string;
  category?: string;
  city?: string;
  date_from?: string;
  price_max?: string;
  sort?: string;
}

interface SearchFiltersProps {
  categories: EventCategory[];
  cities: string[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export function SearchFilters({ categories, cities, values, onChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onChange({ ...values, [key]: value || undefined });
  };

  const clearFilters = () => {
    onChange({ search: values.search });
  };

  const hasActiveFilters = values.category || values.city || values.date_from || values.price_max;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari event, konser, workshop..."
            value={values.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
          )}
        </Button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <Select
            label="Kategori"
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            placeholder="Semua"
            value={values.category || ""}
            onChange={(e) => updateFilter("category", e.target.value)}
          />
          <Select
            label="Kota"
            options={cities.map((c) => ({ value: c, label: c }))}
            placeholder="Semua"
            value={values.city || ""}
            onChange={(e) => updateFilter("city", e.target.value)}
          />
          <Input
            label="Tanggal dari"
            type="date"
            value={values.date_from || ""}
            onChange={(e) => updateFilter("date_from", e.target.value)}
          />
          <Input
            label="Harga maks"
            type="number"
            placeholder="Rp"
            value={values.price_max || ""}
            onChange={(e) => updateFilter("price_max", e.target.value)}
          />
          <Select
            label="Urutkan"
            options={[
              { value: "newest", label: "Terbaru" },
              { value: "popular", label: "Populer" },
              { value: "date", label: "Tanggal terdekat" },
            ]}
            value={values.sort || "newest"}
            onChange={(e) => updateFilter("sort", e.target.value)}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
