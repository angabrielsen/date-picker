import { DatePickerElement } from "./date-picker-element";

if (!customElements.get("date-picker")) {
  // Putting guard rails around this because browsers do not like
  //  having the same custom element defined more than once.
  window.customElements.define("date-picker", DatePickerElement);
}
