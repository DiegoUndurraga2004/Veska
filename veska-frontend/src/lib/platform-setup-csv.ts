import type {
  PlatformSetupCsvPreview,
  PlatformSetupCsvRowError,
  PlatformSetupInitialUser,
  PlatformSetupInitialUserInput,
  PlatformSetupInitialUserRole,
} from "@/types/platform-setup";

export const PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_BYTES = 1_048_576;
export const PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_ROWS = 250;

const allowedRoles = new Set<PlatformSetupInitialUserRole>([
  "company_admin",
  "company_user",
  "read_only",
]);

const allowedProviders = new Set(["microsoft", "google", "local"] as const);

type PlatformSetupCsvParseResult =
  | {
      ok: true;
      preview: PlatformSetupCsvPreview;
    }
  | {
      ok: false;
      error: string;
    };

export function normalizePlatformSetupEmail(value: string) {
  return value.trim().toLowerCase();
}

export function createPlatformSetupLocalId(prefix: string) {
  const randomSuffix =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}-${randomSuffix}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/^\ufeff/, "");
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = false;
        continue;
      }

      currentCell += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function createCsvRowError(
  rowNumber: number,
  rowValues: {
    name: string;
    email: string;
    role: string;
    auth_provider: string;
  },
  errors: string[],
): PlatformSetupCsvRowError {
  return {
    row_number: rowNumber,
    raw: rowValues,
    errors,
  };
}

export async function parsePlatformSetupInitialUsersCsvFile({
  file,
  existingEmails,
  adminEmail,
}: {
  file: File;
  existingEmails: string[];
  adminEmail: string;
}): Promise<PlatformSetupCsvParseResult> {
  // El backend futuro deberá volver a validar límites, tenant y permisos.
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return {
      ok: false,
      error: "Solo se permiten archivos con extensión .csv.",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: "El archivo CSV está vacío.",
    };
  }

  if (file.size > PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_BYTES) {
    return {
      ok: false,
      error:
        "El CSV supera 1 MB. Ajusta el archivo antes de importarlo en el setup local.",
    };
  }

  const text = await file.text();

  if (text.trim().length === 0) {
    return {
      ok: false,
      error: "El archivo CSV no contiene datos utilizables.",
    };
  }

  const rows = parseCsvRows(text);

  if (rows.length === 0) {
    return {
      ok: false,
      error: "No se detectaron filas en el archivo CSV.",
    };
  }

  const [rawHeaders, ...dataRows] = rows;
  const headers = rawHeaders.map(normalizeHeader);
  const requiredHeaders = ["name", "email", "role", "auth_provider"];
  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    return {
      ok: false,
      error: `Faltan encabezados obligatorios: ${missingHeaders.join(", ")}.`,
    };
  }

  if (dataRows.length > PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_ROWS) {
    return {
      ok: false,
      error: `El CSV supera el máximo de ${PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_ROWS} filas permitidas en desarrollo.`,
    };
  }

  const existingNormalizedEmails = new Set(
    existingEmails.map(normalizePlatformSetupEmail),
  );
  const adminEmailNormalized = normalizePlatformSetupEmail(adminEmail);
  const seenEmailsInFile = new Set<string>();
  const validRows: PlatformSetupInitialUser[] = [];
  const invalidRows: PlatformSetupCsvRowError[] = [];

  dataRows.forEach((rowValues, index) => {
    const rowNumber = index + 2;
    const rowObject = headers.reduce<Record<string, string>>((accumulator, header, headerIndex) => {
      accumulator[header] = rowValues[headerIndex]?.trim() ?? "";
      return accumulator;
    }, {});

    const name = (rowObject.name ?? "").trim();
    const email = (rowObject.email ?? "").trim();
    const role = (rowObject.role ?? "").trim().toLowerCase();
    const authProvider = (rowObject.auth_provider ?? "")
      .trim()
      .toLowerCase();

    const rowErrors: string[] = [];
    const normalizedEmail = normalizePlatformSetupEmail(email);

    if (name.length === 0) {
      rowErrors.push("El nombre es obligatorio.");
    }

    if (!isValidEmail(email)) {
      rowErrors.push("El email no es válido.");
    }

    if (!allowedRoles.has(role as PlatformSetupInitialUserRole)) {
      rowErrors.push("El rol no es permitido.");
    }

    if (!allowedProviders.has(authProvider as "microsoft" | "google" | "local")) {
      rowErrors.push("El proveedor de acceso no es permitido.");
    }

    if (normalizedEmail.length > 0) {
      if (seenEmailsInFile.has(normalizedEmail)) {
        rowErrors.push("El email está duplicado dentro del CSV.");
      }

      if (existingNormalizedEmails.has(normalizedEmail)) {
        rowErrors.push("El email ya existe en usuarios manuales o en el administrador inicial.");
      }

      if (normalizedEmail === adminEmailNormalized) {
        rowErrors.push("El email coincide con el administrador inicial.");
      }
    }

    if (rowErrors.length > 0) {
      invalidRows.push(
        createCsvRowError(
          rowNumber,
          {
            name,
            email,
            role,
            auth_provider: authProvider,
          },
          rowErrors,
        ),
      );
      return;
    }

    seenEmailsInFile.add(normalizedEmail);
    existingNormalizedEmails.add(normalizedEmail);

    validRows.push({
      id: createPlatformSetupLocalId("csv-user"),
      name,
      email: normalizedEmail,
      role: role as PlatformSetupInitialUserInput["role"],
      auth_provider: authProvider as PlatformSetupInitialUserInput["auth_provider"],
      source: "csv",
    });
  });

  return {
    ok: true,
    preview: {
      file_name: file.name,
      total_rows: dataRows.length,
      valid_rows: validRows,
      invalid_rows: invalidRows,
    },
  };
}
