import { $, createHtmlElement, createSvgElement } from "./helpers";
import { imageOptions, patternOptions } from "./constants";

// https://br.pinterest.com/felipeog476/image-to-pattern/

// =============================================================================
// todos
// =============================================================================

/*
improve layout
add image attribution
separate pattern logic
*/

// =============================================================================
// elements
// =============================================================================

const img = new Image();
const canvas = new OffscreenCanvas(0, 0);
const context = canvas.getContext("2d", { willReadFrequently: true });
const form = $("#form") as HTMLFormElement;
const inputImage = $("#input") as HTMLImageElement;
const outputSvg = $("#output") as SVGSVGElement;
const downloadButton = $("#download-button") as HTMLButtonElement;
const colorReverseButton = $("#color-reverse") as HTMLButtonElement;

// =============================================================================
// event listeners
// =============================================================================

window.addEventListener("load", handleWindowLoad);
form.addEventListener("submit", handleFormSubmit);
downloadButton.addEventListener("click", handleDownloadButtonClick);
colorReverseButton.addEventListener("click", handleColorReverseButtonClick);

// =============================================================================
// event handlers
// =============================================================================

function handleWindowLoad() {
  const imageSelect = $("#image-select") as HTMLSelectElement;

  imageOptions.forEach(({ textContent, value }) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", value);
    option.textContent = textContent;

    imageSelect.append(option);
  });

  const patternSelect = $("#pattern-select") as HTMLSelectElement;

  patternOptions.forEach(({ textContent, value }) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", value);
    option.textContent = textContent;

    patternSelect.append(option);
  });
}

function handleFormSubmit(event: SubmitEvent) {
  event.preventDefault();

  if (!context) return;

  const formElement = event.target as HTMLFormElement;
  const formData = new FormData(formElement);
  const input = String(formData.get("input"));
  const columns = Number(formData.get("columns"));
  const foreground = String(formData.get("foreground"));
  const background = String(formData.get("background"));
  const margin = Number(formData.get("margin"));
  const pattern = formData.get("pattern") as string;
  const mode = formData.get("mode") as string;
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

  img.onload = () => {
    outputSvg.innerHTML = "";

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const offset = img.width * margin;
    const colCount = columns;
    const width = img.width / colCount;
    const rowCount = Math.floor(img.height / width);
    const height = img.height / rowCount;

    outputSvg.setAttribute(
      "viewBox",
      `0 0 ${colCount * width + offset * 2} ${rowCount * height + offset * 2}`
    );

    const rect = createSvgElement("rect");

    rect.setAttribute("fill", background);
    rect.setAttribute("width", String(colCount * width + offset * 2));
    rect.setAttribute("height", String(rowCount * height + offset * 2));
    outputSvg.append(rect);

    const whites = [] as number[][];
    const blacks = [] as number[][];

    for (let row = 0; row < rowCount; row++) {
      whites[row] = [];
      blacks[row] = [];

      for (let col = 0; col < colCount; col++) {
        const imageData = context.getImageData(
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

    if (pattern === "lines") {
      for (let col = 0; col < colCount; col++) {
        const path = createSvgElement("path");
        let d = "";

        const firstRow = 0;
        const firstItem = matrix[firstRow][col];

        d += `M ${col * width + offset}, ${0 + offset} `;
        // prettier-ignore
        d += [
        "C",
        `${col * width + offset}, ${firstRow * height + height * (1 / 4) + offset}`,
        `${col * width + firstItem * width + offset}, ${firstRow * height + height * (1 / 4) + offset}`,
        `${col * width + firstItem * width + offset}, ${firstRow * height + height * (1 / 2) + offset} `,
      ].join(" ");

        for (let row = 0; row < rowCount - 1; row++) {
          const currItem = matrix[row][col];
          const nextItem = matrix[row + 1][col];

          // prettier-ignore
          d += [
          "C",
          `${col * width + currItem * width + offset}, ${row * height + height + offset}`,
          `${col * width + nextItem * width + offset}, ${(row + 1) * height + offset}`,
          `${col * width + nextItem * width + offset}, ${(row + 1) * height + height * (1 / 2) + offset} `,
        ].join(" ");
        }

        const lastRow = rowCount - 1;
        const lastItem = matrix[lastRow][col];

        // prettier-ignore
        d += [
        "C",
        `${col * width + lastItem * width + offset}, ${lastRow * height + height * (3 / 4) + offset}`,
        `${col * width + offset}, ${lastRow * height + height * (3 / 4) + offset}`,
        `${col * width + offset}, ${lastRow * height + height + offset} `,
      ].join(" ");
        d += `z`;

        path.setAttribute("fill", foreground);
        path.setAttribute("d", d);
        outputSvg.append(path);
      }
    }

    if (pattern === "dots") {
      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const item = matrix[row][col];
          const circle = createSvgElement("circle");

          circle.setAttribute("fill", foreground);
          circle.setAttribute("r", String(item * (width / 2)));
          circle.setAttribute("cx", String(col * width + width / 2 + offset));
          circle.setAttribute("cy", String(row * height + height / 2 + offset));

          outputSvg.append(circle);
        }
      }
    }

    if (pattern === "connected-dots-1") {
      function getRadians(degrees: number) {
        return degrees * (Math.PI / 180);
      }
      function getCos(degrees: number) {
        return Math.cos(getRadians(degrees));
      }
      function getSin(degrees: number) {
        return Math.sin(getRadians(degrees));
      }

      const radius = width * (1 / 3);

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const item = Math.round(matrix[row][col]);
          if (item === 0) continue;

          const circle = createSvgElement("circle");

          circle.setAttribute("fill", foreground);
          circle.setAttribute("r", String(radius));
          circle.setAttribute(
            "cx",
            String(col * width + width * (1 / 2) + offset)
          );
          circle.setAttribute(
            "cy",
            String(row * height + height * (1 / 2) + offset)
          );

          outputSvg.append(circle);

          const nextRowItem = Math.round(matrix?.[row + 1]?.[col]);
          const nextColItem = Math.round(matrix?.[row]?.[col + 1]);

          if (nextColItem === item) {
            const path = createSvgElement("path");

            path.setAttribute("fill", foreground);
            path.setAttribute(
              "d",
              // prettier-ignore
              [
                "M",
                `${col * width + width * (1 / 2) + radius * getCos(-45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(-45) + offset} `,

                "Q",
                `${(col + 1) * width + offset} `,
                `${row * height + height * (1 / 2) + offset} `,
                `${(col + 1) * width + width * (1 / 2) + radius * getCos(-135) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(-45) + offset} `,

                "L",
                `${(col + 1) * width + width * (1 / 2) + radius * getCos(-135) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(45) + offset} `,

                "Q",
                `${(col + 1) * width + offset} `,
                `${row * height + height * (1 / 2) + offset} `,
                `${col * width + width * (1 / 2) + radius * getCos(45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(45) + offset} `,
              ].join("")
            );

            outputSvg.append(path);
          }

          if (nextRowItem === item) {
            const path = createSvgElement("path");

            path.setAttribute("fill", foreground);
            path.setAttribute(
              "d",
              // prettier-ignore
              [
                "M",
                `${col * width + width * (1 / 2) + radius * getCos(45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(45) + offset} `,

                "Q",
                `${col * width + width * (1 / 2) + offset} `,
                `${(row + 1) * height + offset} `,
                `${col * width + width * (1 / 2) + radius * getCos(45) + offset} `,
                `${(row + 1) * height + height * (1 / 2) + radius * getSin(-45) + offset} `,

                "L",
                `${col * width + width * (1 / 2) + radius * getCos(135) + offset} `,
                `${(row + 1) * height + height * (1 / 2) + radius * getSin(-45) + offset} `,

                "Q",
                `${col * width + width * (1 / 2) + offset} `,
                `${(row + 1) * height + offset} `,
                `${col * width + width * (1 / 2) + radius * getCos(135) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(135) + offset} `,
              ].join("")
            );

            outputSvg.append(path);
          }
        }
      }
    }

    // TODO: improve connection between circles
    if (pattern === "connected-dots-2") {
      function getRadians(degrees: number) {
        return degrees * (Math.PI / 180);
      }
      function getCos(degrees: number) {
        return Math.cos(getRadians(degrees));
      }
      function getSin(degrees: number) {
        return Math.sin(getRadians(degrees));
      }

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const item = matrix[row][col];

          const circle = createSvgElement("circle");
          const radius = item * width * (1 / 2);

          circle.setAttribute("fill", foreground);
          circle.setAttribute("r", String(radius));
          circle.setAttribute(
            "cx",
            String(col * width + width * (1 / 2) + offset)
          );
          circle.setAttribute(
            "cy",
            String(row * height + height * (1 / 2) + offset)
          );

          outputSvg.append(circle);

          if (item < 0.5) continue;

          const nextRowItem = matrix?.[row + 1]?.[col];
          const nextColItem = matrix?.[row]?.[col + 1];

          if (nextColItem >= 0.5) {
            const path = createSvgElement("path");
            const nextRadius = nextColItem * width * (1 / 2);

            path.setAttribute("fill", foreground);
            path.setAttribute(
              "d",
              // prettier-ignore
              [
                "M",
                `${col * width + width * (1 / 2) + radius * getCos(-45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(-45) + offset} `,

                "Q",
                `${(col + 1) * width + offset} `,
                `${row * height + height * (1 / 2) + offset} `,
                `${(col + 1) * width + width * (1 / 2) + nextRadius * getCos(-135) + offset} `,
                `${row * height + height * (1 / 2) + nextRadius * getSin(-45) + offset} `,

                "L",
                `${(col + 1) * width + width * (1 / 2) + nextRadius * getCos(-135) + offset} `,
                `${row * height + height * (1 / 2) + nextRadius * getSin(45) + offset} `,

                "Q",
                `${(col + 1) * width + offset} `,
                `${row * height + height * (1 / 2) + offset} `,
                `${col * width + width * (1 / 2) + radius * getCos(45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(45) + offset} `,
              ].join("")
            );

            outputSvg.append(path);
          }

          if (nextRowItem >= 0.5) {
            const path = createSvgElement("path");
            const nextRadius = nextRowItem * width * (1 / 2);

            path.setAttribute("fill", foreground);
            path.setAttribute(
              "d",
              // prettier-ignore
              [
                "M",
                `${col * width + width * (1 / 2) + radius * getCos(45) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(45) + offset} `,

                "Q",
                `${col * width + width * (1 / 2) + offset} `,
                `${(row + 1) * height + offset} `,
                `${col * width + width * (1 / 2) + nextRadius * getCos(45) + offset} `,
                `${(row + 1) * height + height * (1 / 2) + nextRadius * getSin(-45) + offset} `,

                "L",
                `${col * width + width * (1 / 2) + nextRadius * getCos(135) + offset} `,
                `${(row + 1) * height + height * (1 / 2) + nextRadius * getSin(-45) + offset} `,

                "Q",
                `${col * width + width * (1 / 2) + offset} `,
                `${(row + 1) * height + offset} `,
                `${col * width + width * (1 / 2) + radius * getCos(135) + offset} `,
                `${row * height + height * (1 / 2) + radius * getSin(135) + offset} `,
              ].join("")
            );

            outputSvg.append(path);
          }
        }
      }
    }

    if (pattern === "diagonal-dots") {
      for (let row = 0; row < rowCount; row++) {
        const isEven = row % 2 === 0;
        const currColCount = isEven ? colCount : colCount - 1;
        const colOffset = isEven ? width / 2 : width;

        for (let col = 0; col < currColCount; col++) {
          const item = matrix[row][col];
          const circle = createSvgElement("circle");

          circle.setAttribute("fill", foreground);
          circle.setAttribute("r", String(item * (width / 2)));
          circle.setAttribute("cx", String(col * width + colOffset + offset));
          circle.setAttribute("cy", String(row * height + height / 2 + offset));

          outputSvg.append(circle);
        }
      }
    }

    if (pattern === "triangles") {
      for (let col = 0; col < colCount; col++) {
        const path = createSvgElement("path");
        let d = `M ${col * width + offset}, ${0 + offset} `;

        for (let row = 0; row < rowCount; row++) {
          const item = matrix[row][col];

          // prettier-ignore
          d += `L ${col * width + item * width + offset}, ${row * height + height / 2 + offset} `;
          // prettier-ignore
          d += `L ${col * width + offset}, ${row * height + height + offset} `;
        }

        d += `z`;

        path.setAttribute("fill", foreground);
        path.setAttribute("d", d);
        outputSvg.append(path);
      }
    }

    // TODO: create `defs` to reuse faces
    if (pattern === "dice") {
      function createCircle() {
        const c = createSvgElement("circle");

        c.setAttribute("fill", foreground);
        c.setAttribute("r", String(width * 0.1));

        return c;
      }

      for (let col = 0; col < colCount; col++) {
        for (let row = 0; row < rowCount; row++) {
          const item = matrix[row][col];

          const l = col * width; // left offset
          const t = row * height; // top offset

          const face = Math.round(item * 6);
          const c1 = createCircle();
          const c2 = createCircle();
          const c3 = createCircle();
          const c4 = createCircle();
          const c5 = createCircle();
          const c6 = createCircle();

          if (face === 1) {
            c1.setAttribute("cx", String(l + width * (1 / 2) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 2) + offset));

            outputSvg.append(c1);
          }

          if (face === 2) {
            c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c2.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c2.setAttribute("cy", String(t + height * (3 / 4) + offset));

            outputSvg.append(c1, c2);
          }

          if (face === 3) {
            c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c2.setAttribute("cx", String(l + width * (1 / 2) + offset));
            c2.setAttribute("cy", String(t + height * (1 / 2) + offset));

            c3.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c3.setAttribute("cy", String(t + height * (3 / 4) + offset));

            outputSvg.append(c1, c2, c3);
          }

          if (face === 4) {
            c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c2.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c2.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c3.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c3.setAttribute("cy", String(t + height * (3 / 4) + offset));

            c4.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c4.setAttribute("cy", String(t + height * (3 / 4) + offset));

            outputSvg.append(c1, c2, c3, c4);
          }

          if (face === 5) {
            c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c2.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c2.setAttribute("cy", String(t + height * (1 / 4) + offset));

            c3.setAttribute("cx", String(l + width * (1 / 2) + offset));
            c3.setAttribute("cy", String(t + height * (1 / 2) + offset));

            c4.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c4.setAttribute("cy", String(t + height * (3 / 4) + offset));

            c5.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c5.setAttribute("cy", String(t + height * (3 / 4) + offset));

            outputSvg.append(c1, c2, c3, c4, c5);
          }

          if (face === 6) {
            c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c1.setAttribute("cy", String(t + height * (1 / 3) + offset));

            c2.setAttribute("cx", String(l + width * (1 / 2) + offset));
            c2.setAttribute("cy", String(t + height * (1 / 3) + offset));

            c3.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c3.setAttribute("cy", String(t + height * (1 / 3) + offset));

            c4.setAttribute("cx", String(l + width * (1 / 4) + offset));
            c4.setAttribute("cy", String(t + height * (2 / 3) + offset));

            c5.setAttribute("cx", String(l + width * (1 / 2) + offset));
            c5.setAttribute("cy", String(t + height * (2 / 3) + offset));

            c6.setAttribute("cx", String(l + width * (3 / 4) + offset));
            c6.setAttribute("cy", String(t + height * (2 / 3) + offset));

            outputSvg.append(c1, c2, c3, c4, c5, c6);
          }
        }
      }
    }
  };

  img.src = imgSrc;

  inputImage.onload = () => {
    inputImage.style.display = "block";
  };

  inputImage.src = imgSrc;
}

function handleDownloadButtonClick() {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(outputSvg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const link = createHtmlElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "image-to-pattern.svg";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
}

function handleColorReverseButtonClick() {
  const foreground = $("#foreground");
  const background = $("#background");
  const foregroundCopy = foreground.value;

  foreground.value = background.value;
  background.value = foregroundCopy;
}
