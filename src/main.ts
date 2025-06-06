// =============================================================================
// todos
// =============================================================================

/*
add margin to svg
light and dark modes
show original image
different patterns (https://br.pinterest.com/felipeog476/image-to-pattern/)
*/

// =============================================================================
// constants
// =============================================================================

const xmlns = "http://www.w3.org/2000/svg";

// =============================================================================
// elements
// =============================================================================

const img = new Image();
const canvas = new OffscreenCanvas(0, 0);
const context = canvas.getContext("2d", { willReadFrequently: true });
const form = document.querySelector("#file-form") as HTMLFormElement;
const imageForm = document.querySelector("#image-form") as HTMLFormElement;
const outputSvg = document.querySelector("#output") as SVGSVGElement;
const downloadButton = document.querySelector(
  "#download-button"
) as HTMLButtonElement;

// =============================================================================
// event listeners
// =============================================================================

window.addEventListener("load", handleWindowLoad);
form.addEventListener("submit", handleFormSubmit);
imageForm.addEventListener("submit", handleFormSubmit);
downloadButton.addEventListener("click", handleDownloadButtonClick);

// =============================================================================
// event handlers
// =============================================================================

function handleWindowLoad() {
  const imageOptions = ["/skull-0.png", "/skull-1.png", "/skull-2.png"];
  const imageSelect = document.querySelector(
    "#image-select"
  ) as HTMLSelectElement;

  imageOptions.forEach((imageOption) => {
    const option = document.createElement("option");

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

  outputSvg.innerHTML = "";

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const colCount = columns;
    const width = img.width / colCount;
    const rowCount = Math.floor(img.height / width);
    const height = img.height / rowCount;

    outputSvg.setAttribute(
      "viewBox",
      `0 0 ${colCount * width} ${rowCount * height}`
    );

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
      const path = document.createElementNS(xmlns, "path");
      let d = "";

      const firstRow = 0;
      const firstBlack = blacks[firstRow][col];

      d += `M ${col * width}, ${0} `;
      d += [
        "C",
        `${col * width}, ${firstRow * height + height * (1 / 4)}`,
        `${col * width + firstBlack * width}, ${
          firstRow * height + height * (1 / 4)
        }`,
        `${col * width + firstBlack * width}, ${
          firstRow * height + height * (1 / 2)
        } `,
      ].join(" ");

      for (let row = 0; row < rowCount - 1; row++) {
        const currBlack = blacks[row][col];
        const nextBlack = blacks[row + 1][col];

        d += [
          "C",
          `${col * width + currBlack * width}, ${row * height + height}`,
          `${col * width + nextBlack * width}, ${(row + 1) * height}`,
          `${col * width + nextBlack * width}, ${
            (row + 1) * height + height * (1 / 2)
          } `,
        ].join(" ");
      }

      const lastRow = rowCount - 1;
      const lastBlack = blacks[lastRow][col];

      d += [
        "C",
        `${col * width + lastBlack * width}, ${
          lastRow * height + height * (3 / 4)
        }`,
        `${col * width}, ${lastRow * height + height * (3 / 4)}`,
        `${col * width}, ${lastRow * height + height} `,
      ].join(" ");
      d += `z`;

      path.setAttribute("d", d);
      outputSvg.append(path);
    }
  };

  img.src = imgSrc;
}

function handleDownloadButtonClick() {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(outputSvg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "image-to-pattern.svg";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
}
