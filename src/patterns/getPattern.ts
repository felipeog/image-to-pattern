import {
  connectedDots1,
  connectedDots2,
  diagonalDots,
  dice,
  dots,
  letters,
  lines,
  triangles,
} from ".";
import { PatternMap } from "./types";
import type { PatternParameters, PatternReturn } from "./types";

export function getPattern(
  pattern: PatternMap,
  parameters: PatternParameters
): PatternReturn | null {
  switch (pattern) {
    case PatternMap.CONNECTED_DOTS_1:
      return connectedDots1(parameters);

    case PatternMap.CONNECTED_DOTS_2:
      return connectedDots2(parameters);

    case PatternMap.DIAGONAL_DOTS:
      return diagonalDots(parameters);

    case PatternMap.DICE:
      return dice(parameters);

    case PatternMap.DOTS:
      return dots(parameters);

    case PatternMap.LETTERS:
      return letters(parameters);

    case PatternMap.LINES:
      return lines(parameters);

    case PatternMap.TRIANGLES:
      return triangles(parameters);

    default:
      return null;
  }
}
