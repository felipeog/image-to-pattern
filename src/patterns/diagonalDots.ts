import { createSvgElement } from "../helpers";
import { PatternParameters, PatternReturn } from "./types";

export function diagonalDots({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const group = createSvgElement("g");
  const rowCount = matrix.length;
  const colCount = matrix[0].length;

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

      group.append(circle);
    }
  }

  return group;
}
