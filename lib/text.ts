// Source data (area_info.name, hospital_statistics.hospital_name) is stored
// upper-case — normalize to Title Case for display, without mangling apostrophes
// (e.g. "COX'S BAZAR" -> "Cox's Bazar", not "Cox'S Bazar").
export function toTitleCase(value: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
