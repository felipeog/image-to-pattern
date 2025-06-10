import { elements } from "../elements";
import { createHtmlElement } from "../helpers";

export function handleDownloadButtonClick() {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(elements.outputSvg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const link = createHtmlElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "image-to-pattern.svg";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
}
