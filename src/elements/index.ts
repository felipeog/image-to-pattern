import { $ } from "../helpers";

const img = new Image();
const canvas = new OffscreenCanvas(0, 0);
const context = canvas.getContext("2d", { willReadFrequently: true });

export const elements = {
  img,
  canvas,
  context,
  form: $("#form") as HTMLFormElement,
  inputImage: $("#input") as HTMLImageElement,
  outputSvg: $("#output") as SVGSVGElement,
  downloadButton: $("#download-button") as HTMLButtonElement,
  colorReverseButton: $("#color-reverse") as HTMLButtonElement,
};
