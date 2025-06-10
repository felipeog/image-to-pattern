import { elements } from "./elements";
import {
  handleColorReverseButtonClick,
  handleDownloadButtonClick,
  handleFormSubmit,
  handleWindowLoad,
} from "./handlers";

/*
https://br.pinterest.com/felipeog476/image-to-pattern/

todo:
- improve layout
- add image attribution
- separate pattern logic
*/

window.addEventListener("load", handleWindowLoad);

elements.colorReverseButton.addEventListener("click", handleColorReverseButtonClick);
elements.downloadButton.addEventListener("click", handleDownloadButtonClick);
elements.form.addEventListener("submit", handleFormSubmit);
