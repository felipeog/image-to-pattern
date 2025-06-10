import { createSvgElement } from "../helpers";
import type { PatternParameters, PatternReturn } from "./types";

export function connectedDots1({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const group = createSvgElement("g");
  const rowCount = matrix.length;
  const colCount = matrix[0].length;

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
      circle.setAttribute("cx", String(col * width + width * (1 / 2) + offset));
      circle.setAttribute(
        "cy",
        String(row * height + height * (1 / 2) + offset)
      );

      group.append(circle);

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

        group.append(path);
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

        group.append(path);
      }
    }
  }

  return group;
}
