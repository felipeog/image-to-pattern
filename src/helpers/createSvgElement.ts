export function createSvgElement(
  qualifiedName: string,
  options?: ElementCreationOptions
) {
  return document.createElementNS(
    "http://www.w3.org/2000/svg",
    qualifiedName,
    options
  );
}
