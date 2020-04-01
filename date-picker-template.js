const dayTemplate = () => {
  const template = document.createElement("template");
  template.innerHTML = `
    <td>
      <a data-date="" class="day"></a>
    </td>
  `;

  return template;
};

const weekTemplate = () => {
  const template = document.createElement("template");
  template.innerHTML = `
    <tr>
    </tr>
  `;

  return template;
};

const monthTemplate = () => {
  const template = document.createElement("template");
  template.innerHTML = `
    <table class="calendar-table">
      <thead>
        <tr>
          <th id="month-val" class="month" colspan="7"></th>
        </tr>
        <tr>
          <th>Sun</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
        </tr>
      </thead>

      <tbody>
      </tbody>
    </table>
  `;

  return template;
};

const dateRangePickerTemplate = () => {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        position: relative;
      }

      * {
        box-sizing: border-box;
      }

      table,
      tr,
      th,
      td {
        margin: 0;
        padding: 0;
      }

      /* FAUX DROPDOWN MENU */

      :host {
        --date-field-height: 48px;
        --date-field-padding: 12px 18px;

        --date-field-border-color: var(--border-color);
        --date-field-border-hover-color: var(--placeholder-color);
        --date-field-border-focus-color: var(--highlight-color);

        --date-field-font: 16px/24px var(--body-font);

        --date-field-arrow-right: 18px;
      }

      :host([error]) {
        --date-field-border-color: var(--cherry);
      }

      #date-picker-dropdown {
        height: var(--date-field-height);
        width: 100%;
        position: relative;
        background: var(--context-background-color);
        border: 1px solid var(--date-field-border-color);
        font: var(--date-field-font);
        color: var(--context-text-color);
        cursor: pointer;
        transition: border-color var(--basic-hover-speed);
        padding: var(--date-field-padding);
        display: block;
        overflow: hidden;
        z-index: 1;
        box-sizing: border-box;
        border-radius: var(--border-radius);
      }

      :host(.open-right) #date-picker-dropdown {
        border-right: none;
      }

      #date-val {
        display: block;
        text-align: left;
      }

      #date-picker-dropdown::selection {
        background: var(--highlight-color-dim);
      }

      #date-picker-dropdown:hover {
        border-color: var(--field-border-hover-color);
      }

      #arrow {
        content: "";
        display: block;
        position: absolute;
        margin: -3px 0 0;
        top: 50%;
        right: var(--date-field-arrow-right);
        width: 0;
        height: 0;
        border-top: 6px solid var(--placeholder-color);
        border-bottom: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        transition: transform var(--basic-hover-speed) ease-in;
      }

      /* CALENDAR FLYOUT */

      :host {
        --calendar-padding: 18px;
        --calendar-width: 252px;
        --calendar-dropdown-width: calc(var(--calendar-width) + (var(--calendar-padding) * 2));
        --calendar-top-pos: 60px;
        --calendar-cell-height: 36px;
        --calendar-title-font: 500 18px/30px var(--headline-font);
        --calendar-title-bottom: 12px;
        --calendar-day-font: 500 12px/24px var(--headline-font);
        --calendar-cell-font: 14px/36px var(--body-font);
      }

      :host([months="2"]) {
        --calendar-dropdown-width: calc((var(--calendar-width) * 2) + (var(--calendar-padding) * 4));
      }

      :host([months="3"]) {
        --calendar-dropdown-width: calc((var(--calendar-width) * 3) + (var(--calendar-padding) * 6));
      }

      #calendar-flyout {
        --context-background-color: var(--modal-background-color);
        background: var(--modal-background-color);

        padding: var(--calendar-padding);
        width: var(--calendar-dropdown-width);
        /* max-width: 100%; */
        color: var(--heading-color);

        visibility: hidden;
        height: 0;
        opacity: 0;
        display: flex;
        position: absolute;
        top: var(--calendar-top-pos);
        z-index: 1000;
        cursor: auto;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow-with-border);
        transform: translate(0, -12px);
        transition: transform var(--basic-hover-speed) ease-in, opacity var(--basic-hover-speed) ease-in;
      }

      /* CALENDAR TABLE */

      .calendar-table {
        border-collapse: separate;
        border-spacing: 0;
        width: var(--calendar-width);
        flex: 1 1 0;
      }

      .calendar-table + .calendar-table {
        padding-left: calc(var(--calendar-padding) * 2);
      }

      .calendar-table tr {
        display: flex;
        text-align: center;
      }

      .calendar-table th {
        flex: 1 1 0;
        font: var(--calendar-day-font);
        color: var(--text-color-dim);
        text-align: center;
      }

      .calendar-table th.month {
        text-align: center;
        position: relative;
        padding-bottom: 12px;
        padding-bottom: var(--calendar-title-bottom);
        font: var(--calendar-title-font);
      }

      .calendar-table td {
        flex: 1 1 0;
        height: var(--calendar-cell-height);
        font: var(--calendar-cell-font);
        text-align: center;
        cursor: pointer;
      }

      .calendar-table td a {
        text-decoration: none;
        color: var(--text-color);
        display: block;
      }

      .calendar-table td a:hover {
        color: var(--highlight-color);
      }

      .calendar-table td a:active {
        color: var(--highlight-color-dark);
      }

      .calendar-table td a.selected {
        background: var(--highlight-color);
        color: var(--modal-background-color);
      }

      .calendar-table td a.disabled {
        color: var(--placeholder-color);
        cursor: default;
        pointer-events: none;
      }

      .calendar-table td a.dim {
        color: var(--placeholder-color);
      }

      .calendar-table td a.dim.selected,
      .calendar-table td a.disabled.selected {
        background: var(--highlight-color-dim);
        color: var(--modal-background-color);
      }

      /* NEXT/PREV BUTTONS */

      :host {
        --arrow-color: var(--placeholder-color);
        --arrow-size: 30px;
      }

      .shift-button {
        display: flex;
        justify-content: center;
        align-items: center;
        transition: border-color var(--basic-hover-speed);

        width: var(--arrow-size);
        height: var(--arrow-size);

        position: absolute;
        top: var(--calendar-padding);
        z-index: 2;
      }

      .shift-button:hover {
        --arrow-color: var(--highlight-color);
      }
      .shift-button:active {
        --arrow-color: var(--highlight-color-dark);
      }

      .shift-button:after {
        content: "";
        display: block;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }

      #previous {
        left: var(--calendar-padding);
      }

      #previous:after {
        border-right: 6px solid var(--arrow-color);
        border-left: 0;
      }

      #next {
        right: var(--calendar-padding);
      }

      #next:after {
        border-left: 6px solid var(--arrow-color);
        border-right: 0;
      }

      /* OPEN DATE PICKER */

      :host([open="true"]) #date-picker-dropdown {
        border: 1px solid var(--date-field-border-focus-color);
      }

      :host([open="true"]) #date-picker-dropdown #arrow {
        transform: rotate(-180deg);
      }

      :host([open="true"]) #calendar-flyout {
        visibility: visible;
        height: auto;
        transform: translate(0, 0);
        opacity: 1;
      }

      /* ALIGNMENT */

      :host(:not([align])) #calendar-flyout,
      :host([align="left"]) #calendar-flyout {
        left: 0;
      }

      :host([align="center"]) #calendar-flyout {
        left: 50%;
        transform: translate(-50%, -12px);
      }

      :host([align="center"][open="true"]) #calendar-flyout {
        transform: translate(-50%, 0);
      }

      :host([align="right"]) #calendar-flyout {
        right: 0;
      }

      /* SIZES */

      :host([size="small"]) {
        --date-field-height: 36px;
        --date-field-padding: 7px 12px;
        --date-field-font: 14px/18px var(--body-font);
        --date-field-arrow-right: 12px;

        --calendar-padding: 12px;
        --calendar-width: 240px;
        --calendar-top-pos: 42px;
        --calendar-cell-height: 30px;
        --calendar-title-font: 500 14px/24px var(--headline-font);
        --calendar-title-bottom: 6px;
        --calendar-day-font: 500 10px/24px var(--headline-font);
        --calendar-cell-font: 12px/var(--calendar-cell-height) var(--body-font);

        --arrow-size: 18px;
      }
    </style>

    <div id="date-picker-dropdown">
      <span id="date-val" selected-date=""></span>
      <span id="arrow"></span>
    </div>

    <div id="calendar-flyout">
      <a href="#" id="previous" class="shift-button"></a>
      <a href="#" id="next" class="shift-button"></a>
    </div>
  `;

  return template;
};

export { dateRangePickerTemplate, dayTemplate, weekTemplate, monthTemplate };
