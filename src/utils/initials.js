// First letters of the first two words of a name, e.g. "Michael Johnson" -> "MJ".
export function initials(name) {
  if (!name) return 'A';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('') || 'A'
  );
}
