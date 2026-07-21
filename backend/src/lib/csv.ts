function escapeCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(header: string[], rows: (string | number)[][]) {
  const lines = [header, ...rows].map((row) => row.map(escapeCsvValue).join(","));
  return "﻿" + lines.join("\n");
}
