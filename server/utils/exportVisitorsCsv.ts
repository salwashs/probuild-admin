type FieldOption = {
  value: string;
  labelId: string;
  labelEn?: string;
};

export type ExportFormField = {
  key: string;
  labelId: string;
  type: string;
  sortOrder: number;
  options?: unknown;
};

export type ExportVisitorRow = Record<string, unknown> & {
  registrationId?: string;
  createdAt?: Date | string | null;
  checkedInAt?: Date | string | null;
};

function parseOptions(raw: unknown): FieldOption[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as FieldOption[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as FieldOption[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatDateTime(value: unknown): string {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatExportCell(
  field: ExportFormField,
  value: unknown,
): string {
  if (value == null || value === "") return "";

  const options = parseOptions(field.options);

  if (field.type === "select") {
    const opt = options.find((item) => item.value === value);
    return opt?.labelId || String(value);
  }

  if (field.type === "multiselect" && Array.isArray(value)) {
    return value
      .map(
        (item) =>
          options.find((opt) => opt.value === item)?.labelId || String(item),
      )
      .join(", ");
  }

  if (field.type === "boolean") {
    return value ? "Ya" : "Tidak";
  }

  if (field.type === "group" && Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return String(item);
        const row = item as Record<string, unknown>;
        const name = String(row.name || "").trim();
        const position = String(row.position || "").trim();
        if (name && position) return `${name} (${position})`;
        return name || position || "";
      })
      .filter(Boolean)
      .join("; ");
  }

  return String(value);
}

/** Escape one CSV field (RFC 4180). */
function escapeCsvField(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function yyyymmdd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function buildVisitorsExportFilename(slug: string) {
  return `visitors-${slug}-${yyyymmdd()}.csv`;
}

/**
 * Build CSV text with UTF-8 BOM so Excel opens Indonesian characters correctly.
 * No heavy workbook library — low memory.
 */
export function buildVisitorsCsv(params: {
  fields: ExportFormField[];
  visitors: ExportVisitorRow[];
}): string {
  const fields = [...params.fields].sort((a, b) => a.sortOrder - b.sortOrder);

  const headers = [
    "No",
    "ID Registrasi",
    "Tanggal Daftar",
    "Check-in",
    ...fields.map((field) => field.labelId),
  ];

  const lines: string[] = [headers.map(escapeCsvField).join(",")];

  for (let index = 0; index < params.visitors.length; index += 1) {
    const visitor = params.visitors[index];
    const row: (string | number)[] = [
      index + 1,
      String(visitor.registrationId || ""),
      formatDateTime(visitor.createdAt),
      formatDateTime(visitor.checkedInAt),
      ...fields.map((field) => formatExportCell(field, visitor[field.key])),
    ];
    lines.push(row.map(escapeCsvField).join(","));
  }

  // BOM helps Excel detect UTF-8
  return `\uFEFF${lines.join("\r\n")}`;
}
