import { createSvgElement } from "../helpers";
import type { PatternParameters, PatternReturn } from "./types";

export function dice({
  matrix,
  width,
  height,
  offset,
  foreground,
}: PatternParameters): PatternReturn {
  const rowCount = matrix.length;
  const colCount = matrix[0].length;
  const group = createSvgElement("g");
  const defs = createSvgElement("defs");

  defs.innerHTML = `
    <g id="face1">
      <circle
        cx="${width * (1 / 2)}"
        cy="${height * (1 / 2)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
    <g id="face2">
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
    <g id="face3">
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 2)}"
        cy="${height * (1 / 2)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
    <g id="face4">
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
    <g id="face5">
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (1 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 2)}"
        cy="${height * (1 / 2)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (3 / 4)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
    <g id="face6">
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (1 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 2)}"
        cy="${height * (1 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (1 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 4)}"
        cy="${height * (2 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (1 / 2)}"
        cy="${height * (2 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
      <circle
        cx="${width * (3 / 4)}"
        cy="${height * (2 / 3)}"
        r="${width * 0.1}"
        fill="${foreground}"
      />
    </g>
  `;

  group.append(defs);

  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      const item = matrix[row][col];
      const face = Math.round(item * 6);

      if (face < 1 || face > 6) continue;

      const use = createSvgElement("use");

      use.setAttribute("x", String(col * width + offset));
      use.setAttribute("y", String(row * height + offset));
      use.setAttribute("href", `#face${face}`);

      group.append(use);
    }
  }

  return group;
}
