import { createSvgElement } from "../helpers";
import type { PatternParameters, PatternReturn } from "./types";

// TODO: create `defs` to reuse faces
export function dice({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const group = createSvgElement("g");
  const rowCount = matrix.length;
  const colCount = matrix[0].length;

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

        group.append(c1);
      }

      if (face === 2) {
        c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
        c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

        c2.setAttribute("cx", String(l + width * (3 / 4) + offset));
        c2.setAttribute("cy", String(t + height * (3 / 4) + offset));

        group.append(c1, c2);
      }

      if (face === 3) {
        c1.setAttribute("cx", String(l + width * (1 / 4) + offset));
        c1.setAttribute("cy", String(t + height * (1 / 4) + offset));

        c2.setAttribute("cx", String(l + width * (1 / 2) + offset));
        c2.setAttribute("cy", String(t + height * (1 / 2) + offset));

        c3.setAttribute("cx", String(l + width * (3 / 4) + offset));
        c3.setAttribute("cy", String(t + height * (3 / 4) + offset));

        group.append(c1, c2, c3);
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

        group.append(c1, c2, c3, c4);
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

        group.append(c1, c2, c3, c4, c5);
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

        group.append(c1, c2, c3, c4, c5, c6);
      }
    }
  }

  return group;
}
