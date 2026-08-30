export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "America/Santiago",
  year: "numeric",
});

export function formatDateTime(value: string) {
  const parts = dateTimeFormatter.formatToParts(new Date(value));

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");
  const hour24 = Number(getPart("hour"));
  const minute = getPart("minute");

  const period = hour24 < 12 ? "a. m." : "p. m.";
  const hour12 = ((hour24 + 11) % 12) + 1;
  const hour = String(hour12).padStart(2, "0");

  return `${day}-${month}-${year}, ${hour}:${minute} ${period}`;
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** unitIndex;
  const maximumFractionDigits = unitIndex === 0 ? 0 : 1;

  return `${value.toLocaleString("es-CL", {
    maximumFractionDigits,
  })} ${units[unitIndex]}`;
}
