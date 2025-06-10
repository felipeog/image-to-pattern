import { createSvgElement } from "../helpers";
import { elements } from "../elements";
import { getPattern } from "../patterns";
import { PatternMap } from "../patterns/types";
import { templates } from "../generative";
import { GenerativeMap } from "../generative/types";

export function handleFormSubmit(event: SubmitEvent) {
  event.preventDefault();

  const formElement = event.target as HTMLFormElement;
  const formData = new FormData(formElement);

  const input = String(formData.get("input"));
  const columns = Number(formData.get("columns"));
  const foreground = String(formData.get("foreground"));
  const background = String(formData.get("background"));
  const margin = Number(formData.get("margin"));
  const pattern = String(formData.get("pattern")) as PatternMap;
  const generative = String(formData.get("generative")) as GenerativeMap;
  const mode = String(formData.get("mode"));

  let imgSrc = "";

  if (input === "file") {
    const file = formData.get("upload") as Blob;
    if (!file) return;
    imgSrc = URL.createObjectURL(file);
  }

  if (input === "image") {
    const image = String(formData.get("image"));
    if (!image) return;
    imgSrc = image;
  }

  if (input === "generative") {
    const width = Number(formData.get("noise-width"));
    const height = Number(formData.get("noise-height"));

    if (!width || !height) return;

    if (generative === GenerativeMap.NOISE) {
      const template = templates.noise;
      const node = template.content.cloneNode(true) as Element;
      const svg = node.querySelector("#generative-noise-svg") as SVGSVGElement;
      const turbulence = node.querySelector(
        "#generative-noise-turbulence"
      ) as SVGFilterElement;

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      turbulence.setAttribute(
        "seed",
        String(Math.round(Math.random() * 1_000_000))
      );

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      imgSrc = url;
    }
  }

  if (!imgSrc) return;

  elements.img.onload = () => {
    if (!elements.context) return;

    elements.outputSvg.innerHTML = "";
    elements.canvas.width = elements.img.width;
    elements.canvas.height = elements.img.height;
    elements.context.drawImage(elements.img, 0, 0);

    const offset = elements.img.width * margin;
    const colCount = Math.min(elements.img.width, columns);
    const width = Math.max(1, elements.img.width / colCount);
    const rowCount = Math.floor(elements.img.height / width);
    const height = Math.max(1, elements.img.height / rowCount);

    elements.outputSvg.setAttribute(
      "viewBox",
      `0 0 ${colCount * width + offset * 2} ${rowCount * height + offset * 2}`
    );

    const rect = createSvgElement("rect");

    rect.setAttribute("fill", background);
    rect.setAttribute("width", String(colCount * width + offset * 2));
    rect.setAttribute("height", String(rowCount * height + offset * 2));

    elements.outputSvg.append(rect);

    const whites = [] as number[][];
    const blacks = [] as number[][];

    for (let row = 0; row < rowCount; row++) {
      whites[row] = [];
      blacks[row] = [];

      for (let col = 0; col < colCount; col++) {
        const imageData = elements.context.getImageData(
          col * width,
          row * height,
          width,
          height
        );
        const numPixels = width * height;
        const data = imageData.data;

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
        }

        r = Math.round(r / numPixels);
        g = Math.round(g / numPixels);
        b = Math.round(b / numPixels);
        a = Math.round(a / numPixels);

        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const white = luminance / 255;
        const black = (255 - luminance) / 255;

        whites[row].push(white);
        blacks[row].push(black);
      }
    }

    const matrix = mode === "lightness" ? whites : blacks;
    const patternParameters = { matrix, width, height, foreground, offset };
    const group = getPattern(pattern, patternParameters);

    if (!group) return;

    elements.outputSvg.append(group);

    elements.inputImage.src = imgSrc;
    elements.inputImage.style.display = "block";
  };

  elements.img.src = imgSrc;
}
