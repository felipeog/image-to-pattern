// =============================================================================
// todos
// =============================================================================

/*
different patterns (https://br.pinterest.com/felipeog476/image-to-pattern/)
unify shared form inputs
*/

// =============================================================================
// elements
// =============================================================================

const img = new Image();
const canvas = new OffscreenCanvas(0, 0);
const context = canvas.getContext("2d", { willReadFrequently: true });
const fileForm = $("#file-form") as HTMLFormElement;
const imageForm = $("#image-form") as HTMLFormElement;
const inputImage = $("#input") as HTMLImageElement;
const outputSvg = $("#output") as SVGSVGElement;
const downloadButton = $("#download-button") as HTMLButtonElement;

// =============================================================================
// event listeners
// =============================================================================

window.addEventListener("load", handleWindowLoad);
fileForm.addEventListener("submit", handleFormSubmit);
imageForm.addEventListener("submit", handleFormSubmit);
downloadButton.addEventListener("click", handleDownloadButtonClick);

// =============================================================================
// event handlers
// =============================================================================

function handleWindowLoad() {
  const imageOptions = ["/skull-0.png", "/skull-1.png", "/skull-2.png"];
  const imageSelect = $("#image-select") as HTMLSelectElement;

  imageOptions.forEach((imageOption) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", imageOption);
    option.textContent = imageOption;

    imageSelect.append(option);
  });
}

function handleFormSubmit(event: SubmitEvent) {
  event.preventDefault();

  if (!context) return;

  const formElement = event.target as HTMLFormElement;
  const formId = formElement.getAttribute("id");
  const formData = new FormData(formElement);
  const columns = Number(formData.get("columns"));
  const foreground = String(formData.get("foreground"));
  const background = String(formData.get("background"));
  const margin = Number(formData.get("margin"));
  let imgSrc = "";

  if (formId === "file-form") {
    const file = formData.get("upload") as Blob;
    if (!file) return;
    imgSrc = URL.createObjectURL(file);
  }

  if (formId === "image-form") {
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

        const white = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const black = (255 - white) / 255;

        whites[row].push(white);
        blacks[row].push(black);
      }
    }

    for (let col = 0; col < colCount; col++) {
      const path = createSvgElement("path");
      let d = "";

      const firstRow = 0;
      const firstBlack = blacks[firstRow][col];

      d += `M ${col * width + offset}, ${0 + offset} `;
      // prettier-ignore
      d += [
        "C",
        `${col * width + offset}, ${firstRow * height + height * (1 / 4) + offset}`,
        `${col * width + firstBlack * width + offset}, ${firstRow * height + height * (1 / 4) + offset}`,
        `${col * width + firstBlack * width + offset}, ${firstRow * height + height * (1 / 2) + offset} `,
      ].join(" ");

      for (let row = 0; row < rowCount - 1; row++) {
        const currBlack = blacks[row][col];
        const nextBlack = blacks[row + 1][col];

        // prettier-ignore
        d += [
          "C",
          `${col * width + currBlack * width + offset}, ${row * height + height + offset}`,
          `${col * width + nextBlack * width + offset}, ${(row + 1) * height + offset}`,
          `${col * width + nextBlack * width + offset}, ${(row + 1) * height + height * (1 / 2) + offset} `,
        ].join(" ");
      }

      const lastRow = rowCount - 1;
      const lastBlack = blacks[lastRow][col];

      // prettier-ignore
      d += [
        "C",
        `${col * width + lastBlack * width + offset}, ${lastRow * height + height * (3 / 4) + offset}`,
        `${col * width + offset}, ${lastRow * height + height * (3 / 4) + offset}`,
        `${col * width + offset}, ${lastRow * height + height + offset} `,
      ].join(" ");
      d += `z`;

      path.setAttribute("fill", foreground);
      path.setAttribute("d", d);
      outputSvg.append(path);
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

// =============================================================================
// helpers
// =============================================================================

function $(selectors: any) {
  return document.querySelector(selectors);
}

// function $$(selectors: any) {
//   return document.querySelectorAll(selectors);
// }

function createHtmlElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions
) {
  return document.createElement(tagName, options);
}

function createSvgElement(
  qualifiedName: string,
  options?: ElementCreationOptions
) {
  return document.createElementNS(
    "http://www.w3.org/2000/svg",
    qualifiedName,
    options
  );
}
