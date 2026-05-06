"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFormField } from "@/lib/types/event";

interface DynamicFormProps {
  fields: CustomFormField[];
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export function DynamicForm({ fields, values, errors, onChange }: DynamicFormProps) {
  return (
    <div className="space-y-4">
      {fields
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            value={values[field.id] || ""}
            error={errors?.[field.id]}
            onChange={(v) => onChange(field.id, v)}
          />
        ))}
    </div>
  );
}

function DynamicField({
  field,
  value,
  error,
  onChange,
}: {
  field: CustomFormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const label = `${field.label}${field.is_required ? " *" : ""}`;

  switch (field.field_type) {
    case "text":
      return (
        <Input
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.is_required}
        />
      );

    case "textarea":
      return (
        <Textarea
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.is_required}
        />
      );

    case "select":
      return (
        <Select
          label={label}
          options={(field.options || []).map((opt) => ({ value: opt, label: opt }))}
          placeholder="Pilih..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.is_required}
        />
      );

    case "checkbox":
      return (
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) => onChange(String(e.target.checked))}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{field.label}</span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case "radio":
      return (
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="h-4 w-4 border-zinc-300"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{opt}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    default:
      return null;
  }
}
