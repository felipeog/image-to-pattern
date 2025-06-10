import { createSvgElement } from "../helpers";
import { PatternParameters, PatternReturn } from "./types";

export function triangles({
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
    group.append(path);
  }

  return group;
}
