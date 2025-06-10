import { $ } from "../helpers";

export function handleColorReverseButtonClick() {
  const foreground = $("#foreground");
  const background = $("#background");
  const foregroundCopy = foreground.value;

  foreground.value = background.value;
  background.value = foregroundCopy;
}
