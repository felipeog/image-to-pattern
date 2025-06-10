import { createSvgElement } from "../helpers";
import type { PatternParameters, PatternReturn } from "./types";

export function lines({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const group = createSvgElement("g");
  const rowCount = matrix.length;
  const colCount = matrix[0].length;

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

    group.append(path);
  }

  return group;
}
