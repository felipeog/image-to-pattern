import { $, createHtmlElement } from "../helpers";
import { imageOptions, patternOptions, generativeOptions } from "../constants";

export function handleWindowLoad() {
  const imageSelect = $("#image-select") as HTMLSelectElement;
  const patternSelect = $("#pattern-select") as HTMLSelectElement;
  const generativeSelect = $("#generative-select") as HTMLSelectElement;

  imageOptions.forEach(({ textContent, value }) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", value);
    option.textContent = textContent;

    imageSelect.append(option);
  });

  patternOptions.forEach(({ textContent, value }) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", value);
    option.textContent = textContent;

    patternSelect.append(option);
  });

  generativeOptions.forEach(({ textContent, value }) => {
    const option = createHtmlElement("option");

    option.setAttribute("value", value);
    option.textContent = textContent;

    generativeSelect.append(option);
  });
}
