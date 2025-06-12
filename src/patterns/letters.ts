import { createHtmlElement, createSvgElement } from "../helpers";
import type { PatternParameters, PatternReturn } from "./types";

export function letters({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const rowCount = matrix.length;
  const colCount = matrix[0].length;
  const style = createHtmlElement("style");
  const group = createSvgElement("g");

  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..700&display=swap');

    text {
      font-family: "Roboto Mono", monospace;
      font-size: ${Math.min(width, height)}px;
      fill: ${foreground};
      dominant-baseline: middle;
      text-anchor: middle;
    }
  `;

  group.append(style);

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const item = matrix[row][col];
      const weight = Math.ceil(item * 600) + 100;
      const text = createSvgElement("text");

      text.textContent = getRandomLetter();
      text.setAttribute("x", String(col * width + width * (1 / 2) + offset));
      text.setAttribute("y", String(row * height + height * (1 / 2) + offset));
      text.setAttribute(
        "style",
        `
          font-weight: ${weight};
          opacity: ${item};
        `
      );

      group.append(text);
    }
  }

  return group;
}

function getRandomLetter() {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = Math.floor(Math.random() * letters.length);

  return letters[index];
}
