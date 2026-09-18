import { prisma } from "../../lib/prisma";

type EventFormFields = {
  id: string;
  eventId: string;
  key: string;
  labelId: string;
  type: string;
  required: boolean;
  sortOrder: number;
  showInTable: boolean;
  indexAs: string | null;
  uniquePerEvent: boolean;
  validation: unknown;
  options: unknown;
  conditions: unknown;
};

type Events = {
  id: string;
  slug: string;
  name: string;
  registrationPrefix: string;
  visitorSeq: number;
};

type Visitors = {
  id: string;
  eventId: string;
  registrationId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  identityNumber: string | null;
  payload: unknown;
  language: string;
  submittedAt: Date | null;
  checkedInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FieldOption = {
  value: string;
  labelId: string;
  labelEn?: string;
};

export type FieldItemSpec = {
  key: string;
  minLength?: number;
  required?: boolean;
};

export type FieldValidation = {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  minItems?: number;
  mustBe?: boolean | string | number;
  itemFields?: FieldItemSpec[];
  lengthEqualsField?: string;
  offset?: number;
};

export type FieldCondition = {
  field: string;
  eq?: unknown;
  gt?: number;
  contains?: string;
};

export type FieldConditions = {
  requiredIf?: FieldCondition;
  showIf?: FieldCondition;
};

export type IndexedAs = "fullName" | "email" | "phone" | "identityNumber";

const META_KEYS = new Set(["id", "eventId", "eventSlug"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class VisitorValidationError extends Error {
  statusCode = 422;
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = "Validasi gagal") {
    super(message);
    this.name = "VisitorValidationError";
    this.errors = errors;
  }
}

export class VisitorConflictError extends Error {
  statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = "VisitorConflictError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseJson<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  return value as T;
}

export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return false;
  return false;
}

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function addError(
  errors: Record<string, string[]>,
  key: string,
  message: string,
) {
  if (!errors[key]) errors[key] = [];
  errors[key].push(message);
}

export function conditionMatches(
  condition: FieldCondition | undefined,
  payload: Record<string, unknown>,
): boolean {
  if (!condition) return false;
  const raw = payload[condition.field];

  if (condition.eq !== undefined) {
    return raw === condition.eq || asString(raw) === asString(condition.eq);
  }
  if (condition.gt !== undefined) {
    return Number(raw) > condition.gt;
  }
  if (condition.contains !== undefined) {
    if (Array.isArray(raw)) {
      return raw.map(asString).includes(condition.contains);
    }
    return asString(raw).includes(condition.contains);
  }
  return false;
}

function isFieldVisible(
  conditions: FieldConditions | undefined,
  payload: Record<string, unknown>,
): boolean {
  if (!conditions?.showIf) return true;
  return conditionMatches(conditions.showIf, payload);
}

function isFieldRequired(
  field: EventFormFields,
  conditions: FieldConditions | undefined,
  payload: Record<string, unknown>,
): boolean {
  if (field.required) return true;
  if (conditions?.requiredIf) {
    return conditionMatches(conditions.requiredIf, payload);
  }
  return false;
}

function validatePrimitive(
  field: EventFormFields,
  value: unknown,
  validation: FieldValidation | undefined,
  errors: Record<string, string[]>,
) {
  const key = field.key;

  if (field.type === "email") {
    const str = asString(value);
    if (!EMAIL_RE.test(str)) {
      addError(errors, key, "Format email tidak valid");
    }
  }

  if (field.type === "number") {
    const num = Number(value);
    if (Number.isNaN(num)) {
      addError(errors, key, `${field.labelId} harus berupa angka`);
      return;
    }
    if (validation?.min != null && num < validation.min) {
      addError(errors, key, `${field.labelId} minimal ${validation.min}`);
    }
    if (validation?.max != null && num > validation.max) {
      addError(errors, key, `${field.labelId} maksimal ${validation.max}`);
    }
  }

  if (
    field.type === "text" ||
    field.type === "tel" ||
    field.type === "textarea" ||
    field.type === "email" ||
    field.type === "select"
  ) {
    const str = asString(value);
    if (validation?.minLength != null && str.length < validation.minLength) {
      addError(
        errors,
        key,
        `${field.labelId} minimal ${validation.minLength} karakter`,
      );
    }
    if (validation?.maxLength != null && str.length > validation.maxLength) {
      addError(
        errors,
        key,
        `${field.labelId} maksimal ${validation.maxLength} karakter`,
      );
    }
    if (validation?.exactLength != null && !validation?.pattern && str.length !== validation.exactLength) {
      addError(
        errors,
        key,
        key === "identityNumber"
          ? "Nomor KTP harus 16 digit"
          : `${field.labelId} harus ${validation.exactLength} karakter`,
      );
    }
    if (validation?.pattern) {
      const re = new RegExp(validation.pattern);
      if (!re.test(str)) {
        if (key === "identityNumber") {
          addError(errors, key, "Nomor KTP harus 16 digit");
        } else if (key === "whatsapp") {
          addError(errors, key, "Nomor WhatsApp harus 8–16 digit");
        } else {
          addError(errors, key, `Format ${field.labelId} tidak valid`);
        }
      }
    }
  }

  if (field.type === "select") {
    const options = parseJson<FieldOption[]>(field.options) ?? [];
    const str = asString(value);
    if (options.length && !options.some((opt) => opt.value === str)) {
      addError(errors, key, `${field.labelId} tidak valid`);
    }
  }

  if (field.type === "multiselect") {
    if (!Array.isArray(value)) {
      addError(errors, key, `${field.labelId} harus berupa daftar`);
      return;
    }
    const options = parseJson<FieldOption[]>(field.options) ?? [];
    const allowed = new Set(options.map((opt) => opt.value));
    if (validation?.minItems != null && value.length < validation.minItems) {
      addError(
        errors,
        key,
        `${field.labelId} minimal ${validation.minItems} item`,
      );
    }
    if (options.length && value.some((item) => !allowed.has(asString(item)))) {
      addError(errors, key, `${field.labelId} berisi nilai yang tidak valid`);
    }
  }

  if (field.type === "boolean") {
    if (typeof value !== "boolean") {
      addError(errors, key, `${field.labelId} harus berupa boolean`);
      return;
    }
    if (validation?.mustBe !== undefined && value !== validation.mustBe) {
      addError(errors, key, `${field.labelId} wajib disetujui`);
    }
  }
}

function validateGroup(
  field: EventFormFields,
  value: unknown,
  validation: FieldValidation | undefined,
  payload: Record<string, unknown>,
  required: boolean,
  errors: Record<string, string[]>,
) {
  const key = field.key;

  if (isEmpty(value)) {
    if (required) {
      addError(errors, key, `${field.labelId} wajib diisi`);
    }
    return;
  }

  if (!Array.isArray(value)) {
    addError(errors, key, `${field.labelId} harus berupa daftar`);
    return;
  }

  if (validation?.lengthEqualsField) {
    const base = Number(payload[validation.lengthEqualsField]);
    const expected = base + (validation.offset ?? 0);
    if (!Number.isNaN(base) && value.length !== expected) {
      addError(
        errors,
        key,
        `${field.labelId} harus berisi ${expected} orang`,
      );
    }
  }

  const itemFields = validation?.itemFields ?? [];
  value.forEach((item, index) => {
    const row = asRecord(item);
    for (const spec of itemFields) {
      const cell = row[spec.key];
      const path = `${key}[${index}].${spec.key}`;
      if (spec.required !== false && isEmpty(cell)) {
        addError(errors, path, `${spec.key} wajib diisi`);
        continue;
      }
      const str = asString(cell);
      if (spec.minLength != null && str.length < spec.minLength) {
        addError(
          errors,
          path,
          `${spec.key} minimal ${spec.minLength} karakter`,
        );
      }
    }
  });
}

function coerceValue(field: EventFormFields, value: unknown): unknown {
  if (isEmpty(value) && value !== false) {
    if (field.type === "multiselect" || field.type === "group") return [];
    if (field.type === "boolean") return false;
    return null;
  }

  if (field.type === "number") {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }

  if (field.type === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === 1 || value === "1") return true;
    if (value === "false" || value === 0 || value === "0") return false;
    return value;
  }

  if (field.type === "multiselect" || field.type === "group") {
    return Array.isArray(value) ? value : value;
  }

  if (
    field.type === "text" ||
    field.type === "tel" ||
    field.type === "textarea" ||
    field.type === "email" ||
    field.type === "select"
  ) {
    return asString(value);
  }

  return value;
}

export function validateVisitorPayload(
  fields: EventFormFields[],
  body: Record<string, unknown>,
): Record<string, unknown> {
  const sorted = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const payload: Record<string, unknown> = {};

  for (const field of sorted) {
    payload[field.key] = coerceValue(field, body[field.key]);
  }

  const errors: Record<string, string[]> = {};

  for (const field of sorted) {
    const conditions = parseJson<FieldConditions>(field.conditions);
    const visible = isFieldVisible(conditions, payload);
    const required = isFieldRequired(field, conditions, payload);
    const value = payload[field.key];
    const validation = parseJson<FieldValidation>(field.validation);

    if (!visible) {
      if (field.type === "multiselect" || field.type === "group") {
        payload[field.key] = [];
      } else if (field.type === "boolean") {
        payload[field.key] = false;
      } else {
        payload[field.key] = null;
      }
      continue;
    }

    if (required && isEmpty(value) && field.type !== "boolean") {
      addError(errors, field.key, `${field.labelId} wajib diisi`);
      continue;
    }

    if (field.type === "boolean" && required) {
      validatePrimitive(field, value, validation, errors);
      continue;
    }

    if (isEmpty(value) && field.type !== "boolean") continue;

    if (field.type === "group") {
      validateGroup(field, value, validation, payload, required, errors);
    } else {
      validatePrimitive(field, value, validation, errors);
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new VisitorValidationError(errors);
  }

  return payload;
}

export function extractIndexedFields(
  fields: EventFormFields[],
  payload: Record<string, unknown>,
) {
  const indexed: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    identityNumber: string | null;
  } = {
    fullName: null,
    email: null,
    phone: null,
    identityNumber: null,
  };

  for (const field of fields) {
    if (!field.indexAs) continue;
    const value = payload[field.key];
    const str = isEmpty(value) ? null : asString(value);
    if (field.indexAs === "fullName") indexed.fullName = str;
    if (field.indexAs === "email") indexed.email = str;
    if (field.indexAs === "phone") indexed.phone = str;
    if (field.indexAs === "identityNumber") indexed.identityNumber = str;
  }

  return indexed;
}

export async function assertUniquePerEvent(
  fields: EventFormFields[],
  eventId: string,
  payload: Record<string, unknown>,
  excludeVisitorId?: string,
) {
  for (const field of fields) {
    if (!field.uniquePerEvent) continue;
    const value = payload[field.key];
    if (isEmpty(value)) continue;

    const str = asString(value);
    const where: Record<string, unknown> = { eventId };

    if (field.indexAs === "email") where.email = str;
    else if (field.indexAs === "identityNumber") where.identityNumber = str;
    else if (field.indexAs === "phone") where.phone = str;
    else if (field.indexAs === "fullName") where.fullName = str;
    else {
      continue;
    }

    const existing = await prisma.visitors.findFirst({
      where: {
        ...(where as { eventId: string }),
        ...(excludeVisitorId ? { NOT: { id: excludeVisitorId } } : {}),
      },
    });

    if (existing) {
      const label =
        field.indexAs === "email"
          ? "email"
          : field.indexAs === "identityNumber"
            ? "nomor KTP"
            : field.labelId;
      throw new VisitorConflictError(
        `Konfirmasi untuk ${label} ini sudah tercatat.`,
      );
    }
  }
}

export function parseSubmittedAt(value: unknown): Date | null {
  if (isEmpty(value)) return null;
  const date = new Date(asString(value));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatRegistrationId(prefix: string, seq: number) {
  return `${prefix}-${String(seq).padStart(5, "0")}`;
}

export function flattenVisitor(visitor: Visitors) {
  const payload = asRecord(visitor.payload);
  return {
    ...payload,
    id: visitor.id,
    eventId: visitor.eventId,
    registrationId: visitor.registrationId,
    fullName: visitor.fullName,
    email: visitor.email,
    phone: visitor.phone,
    identityNumber: visitor.identityNumber,
    language: visitor.language,
    submittedAt: visitor.submittedAt,
    checkedInAt: visitor.checkedInAt,
    createdAt: visitor.createdAt,
    updatedAt: visitor.updatedAt,
  };
}

export function pickBody(body: unknown): Record<string, unknown> {
  const record = asRecord(body);
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (META_KEYS.has(key)) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

export function visitorHttpError(error: unknown) {
  if (error instanceof VisitorValidationError) {
    return {
      statusCode: 422,
      statusMessage: "Unprocessable Entity",
      message: error.message,
      data: {
        success: false,
        message: error.message,
        errors: error.errors,
      },
    };
  }

  if (error instanceof VisitorConflictError) {
    return {
      statusCode: 409,
      statusMessage: "Conflict",
      message: error.message,
      data: {
        success: false,
        message: error.message,
      },
    };
  }

  return null;
}

export async function createVisitorForEvent(
  event: Events & { fields: EventFormFields[] },
  body: Record<string, unknown>,
) {
  const payload = validateVisitorPayload(event.fields, pickBody(body));
  await assertUniquePerEvent(event.fields, event.id, payload);
  const indexed = extractIndexedFields(event.fields, payload);
  const language = asString(payload.language) || "id";
  const submittedAt = parseSubmittedAt(payload.submittedAt);

  const visitor = await prisma.$transaction(async (tx) => {
    const updatedEvent = await tx.events.update({
      where: { id: event.id },
      data: { visitorSeq: { increment: 1 } },
    });

    const registrationId = formatRegistrationId(
      updatedEvent.registrationPrefix,
      updatedEvent.visitorSeq,
    );

    return tx.visitors.create({
      data: {
        eventId: event.id,
        registrationId,
        payload: JSON.parse(JSON.stringify(payload)),
        language: language.slice(0, 2),
        submittedAt,
        ...indexed,
      },
    });
  });

  return visitor;
}

export async function updateVisitorForEvent(
  visitorId: string,
  event: Events & { fields: EventFormFields[] },
  body: Record<string, unknown>,
) {
  const payload = validateVisitorPayload(event.fields, pickBody(body));
  await assertUniquePerEvent(event.fields, event.id, payload, visitorId);
  const indexed = extractIndexedFields(event.fields, payload);
  const language = asString(payload.language) || "id";
  const parsedSubmittedAt = parseSubmittedAt(payload.submittedAt);

  const existing = await prisma.visitors.findUnique({
    where: { id: visitorId },
  });

  return prisma.visitors.update({
    where: { id: visitorId },
    data: {
      payload: JSON.parse(JSON.stringify(payload)),
      language: language.slice(0, 2),
      submittedAt: parsedSubmittedAt ?? existing?.submittedAt ?? null,
      ...indexed,
    },
  });
}

export async function getEventWithFields(where: {
  id?: string;
  slug?: string;
}) {
  return prisma.events.findFirst({
    where,
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
}

/** Fields the public expo form actually collects as required. */
export const PUBLIC_RSVP_REQUIRED_KEYS = new Set([
  "fullName",
  "email",
  "whatsapp",
  "institution",
  "termsAccepted",
  "language",
]);

/**
 * Soften EventFormFields for public RSVP so stale production DB
 * (old required:true on KTP/rombongan/etc.) does not reject the short form.
 * Admin CRUD still uses raw DB field definitions.
 */
export function softenFieldsForPublicRsvp<
  T extends { key: string; required: boolean },
>(fields: T[]): T[] {
  return fields.map((field) => {
    if (PUBLIC_RSVP_REQUIRED_KEYS.has(field.key)) return field;
    if (!field.required) return field;
    return { ...field, required: false };
  });
}
