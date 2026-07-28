export function escapeXml(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function xmlValue(value: string | number | null | undefined, useNull = true): string {
  if (value == null || value === "") return useNull ? "<null/>" : "";
  return escapeXml(value);
}

export function replaceFirst(xml: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(xml)) return xml;
  pattern.lastIndex = 0;
  return xml.replace(pattern, replacement);
}

export function replaceElement(
  xml: string,
  tag: string,
  value: string | number | null | undefined,
  options: { useNull?: boolean; occurrence?: number } = {},
): string {
  const useNull = options.useNull ?? true;
  const occurrence = options.occurrence ?? 0;
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>(?:[\\s\\S]*?)<\\/${tag}>|<${tag}\\s*\\/>`, "g");
  const matches = Array.from(xml.matchAll(regex));
  const match = matches[occurrence];
  if (!match || match.index == null) return xml;
  const replacement = `<${tag}>${xmlValue(value, useNull)}</${tag}>`;
  return xml.slice(0, match.index) + replacement + xml.slice(match.index + match[0].length);
}

export function replaceBlock(xml: string, pattern: RegExp, replacement: string): string {
  return replaceFirst(xml, pattern, replacement);
}

export function insertCommentAfterDeclaration(xml: string, comment: string): string {
  const declaration = /^<\?xml[^?]*\?>/;
  if (declaration.test(xml)) {
    return xml.replace(declaration, (match) => `${match}\n<!-- ${escapeXml(comment)} -->`);
  }
  return `<!-- ${escapeXml(comment)} -->\n${xml}`;
}
