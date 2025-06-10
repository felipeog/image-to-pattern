import { createSvgElement } from "../helpers";
import { PatternParameters, PatternReturn } from "./types";

export function dots({
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
    for (let col = 0; col < colCount; col++) {
      const item = matrix[row][col];
      const circle = createSvgElement("circle");

      circle.setAttribute("fill", foreground);
      circle.setAttribute("r", String(item * (width / 2)));
      circle.setAttribute("cx", String(col * width + width / 2 + offset));
      circle.setAttribute("cy", String(row * height + height / 2 + offset));

      group.append(circle);
    }
  }

  return group;
}
