import { elements } from "../elements";
import { createSvgElement } from "../helpers";
import {
  connectedDots1,
  connectedDots2,
  diagonalDots,
  dice,
  dots,
  lines,
  triangles,
} from "../patterns";

export function handleFormSubmit(event: SubmitEvent) {
  event.preventDefault();

  const formElement = event.target as HTMLFormElement;
  const formData = new FormData(formElement);

  const input = String(formData.get("input"));
  const columns = Number(formData.get("columns"));
  const foreground = String(formData.get("foreground"));
  const background = String(formData.get("background"));
  const margin = Number(formData.get("margin"));
  const pattern = String(formData.get("pattern"));
  const mode = String(formData.get("mode"));

  let imgSrc = "";

  if (input === "file") {
    const file = formData.get("upload") as Blob;

    if (!file) return;

    imgSrc = URL.createObjectURL(file);
  }

  if (input === "image") {
    const image = formData.get("image") as string;

    if (!image) return;

    imgSrc = image;
  }

  if (!imgSrc) return;

  elements.img.onload = () => {
    if (!elements.context) return;

    elements.outputSvg.innerHTML = "";
    elements.canvas.width = elements.img.width;
    elements.canvas.height = elements.img.height;
    elements.context.drawImage(elements.img, 0, 0);

    const offset = elements.img.width * margin;
    const colCount = columns;
    const width = elements.img.width / colCount;
    const rowCount = Math.floor(elements.img.height / width);
    const height = elements.img.height / rowCount;

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

    if (pattern === "lines") {
      elements.outputSvg.append(lines(patternParameters));
    }

    if (pattern === "dots") {
      elements.outputSvg.append(dots(patternParameters));
    }

    if (pattern === "connected-dots-1") {
      elements.outputSvg.append(connectedDots1(patternParameters));
    }

    if (pattern === "connected-dots-2") {
      elements.outputSvg.append(connectedDots2(patternParameters));
    }

    if (pattern === "diagonal-dots") {
      elements.outputSvg.append(diagonalDots(patternParameters));
    }

    if (pattern === "triangles") {
      elements.outputSvg.append(triangles(patternParameters));
    }

    if (pattern === "dice") {
      elements.outputSvg.append(dice(patternParameters));
    }

    elements.inputImage.src = imgSrc;
    elements.inputImage.style.display = "block";
  };

  elements.img.src = imgSrc;
}
