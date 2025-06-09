export function createHtmlElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions
) {
  return document.createElement(tagName, options);
}
