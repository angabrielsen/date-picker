import { buildShadow } from "../shared/utils";
import {
  dateRangePickerTemplate,
  monthTemplate,
  weekTemplate,
  dayTemplate
} from "./date-picker-template";
import format from "date-fns/format";
import addMonths from "date-fns/addMonths";
import isBefore from "date-fns/isBefore";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  lastDayOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  isSameDay
} from "date-fns";

const DAYS_IN_WEEK = 7;
const DAYS_IN_SIX_WEEKS = 42;
function getMonthWeeks(
  date,
  { forceSixWeeks = false, weekStartsOn = 0, locale } = {}
) {
  const weekOptions = { weekStartsOn, locale };
  const monthFirstDate = startOfMonth(date);
  const monthLastDate = endOfMonth(date);
  const monthFirstWeekdayDate = startOfWeek(monthFirstDate, weekOptions);
  const monthLastWeekdayDate = lastDayOfWeek(monthLastDate, weekOptions);

  let currentEndOfWeek = endOfWeek(monthFirstWeekdayDate, weekOptions);
  let days = eachDayOfInterval({
    start: monthFirstWeekdayDate,
    end: monthLastWeekdayDate
  });

  let week = [];

  if (forceSixWeeks && days.length < DAYS_IN_SIX_WEEKS) {
    days = eachDayOfInterval({
      start: monthFirstWeekdayDate,
      end: addWeeks(
        monthLastWeekdayDate,
        (DAYS_IN_SIX_WEEKS % days.length) / DAYS_IN_WEEK
      )
    });
  }

  return days.reduce((weeks, day) => {
    week.push(day);
    if (isSameDay(day, currentEndOfWeek)) {
      weeks.push(week);
      week = [];
    } else {
      currentEndOfWeek = endOfWeek(day, weekOptions);
    }
    return weeks;
  }, []);
}

class DatePickerElement extends HTMLElement {
  constructor() {
    super();

    this._date = new Date();
    this._pickerDate = this._date;
    this._$month = null;
  }

  connectedCallback() {
    buildShadow(this, dateRangePickerTemplate());

    const presetDate = this.getAttribute("date");

    if (presetDate) {
      const defaultDate = new Date(presetDate);
      const utcDefault = new Date(
        defaultDate.getUTCFullYear(),
        defaultDate.getUTCMonth(),
        defaultDate.getUTCDate()
      );

      this._date = utcDefault ? utcDefault : new Date();

      this._pickerDate = this._date;
    }

    const $calenders = this.shadowRoot.getElementById("calendar-flyout");

    const $month = DatePickerElement.buildDom(
      $calenders,
      this._pickerDate,
      this._date
    );

    $calenders.appendChild($month);

    this._$month = $calenders.querySelector("table");

    DatePickerElement.addEventListenersToCalendar(
      $calenders,
      this.dayClickedEventHandler.bind(this)
    );

    const $dateVal = this.shadowRoot.getElementById("date-val");
    $dateVal.innerHTML = format(this.date, "PP");

    const $datePickerDropdown = this.shadowRoot.getElementById(
      "date-picker-dropdown"
    );

    $datePickerDropdown.addEventListener("click", () => {
      if (this.open && this.open == "true") {
        this.closeDatePicker();
      } else {
        this.openDatePicker();
      }
    });

    const $previousMonthButton = this.shadowRoot.getElementById("previous");
    const $nextMonthButton = this.shadowRoot.getElementById("next");

    $previousMonthButton.addEventListener("click", event => {
      event.preventDefault();
      this._pickerDate = addMonths(this._pickerDate, -1);
      const $month = DatePickerElement.buildDom(
        $calenders,
        this._pickerDate,
        this._date
      );

      $calenders.replaceChild($month, this._$month);
      this._$month = $calenders.querySelector("table");

      DatePickerElement.addEventListenersToCalendar(
        $calenders,
        this.dayClickedEventHandler.bind(this)
      );
    });

    $nextMonthButton.addEventListener("click", event => {
      event.preventDefault();
      this._pickerDate = addMonths(this._pickerDate, 1);
      const $month = DatePickerElement.buildDom(
        $calenders,
        this._pickerDate,
        this._date
      );

      $calenders.replaceChild($month, this._$month);
      this._$month = $calenders.querySelector("table");

      DatePickerElement.addEventListenersToCalendar(
        $calenders,
        this.dayClickedEventHandler.bind(this)
      );
    });
  }

  static buildDom($calendar, date, currentDate) {
    const $monthTemplate = document.importNode(monthTemplate().content, true);
    const monthMmm = format(date, "MMM");
    $monthTemplate.getElementById("month-val").innerHTML =
      format(date, "MMMM") + " " + format(date, "yyyy");

    const today = new Date();
    const utcToday = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    const weeks = getMonthWeeks(date);

    weeks.forEach(week => {
      const $weekTemplate = document.importNode(weekTemplate().content, true);
      const $weekRow = $weekTemplate.querySelector("tr");

      week.forEach(day => {
        const $dayTemplate = document.importNode(dayTemplate().content, true);
        const formattedDay = format(day, "yyyy-MM-dd");
        const formattedCurrentDay = format(currentDate, "yyyy-MM-dd");

        const $a = $dayTemplate.querySelector("a");

        $a.textContent = format(day, "d");

        if (isBefore(day, utcToday)) {
          $a.classList.add("disabled");
        } else if (day.toString().indexOf(monthMmm) < 0) {
          $a.classList.add("dim");
        }

        if (formattedDay === formattedCurrentDay) {
          $a.classList.add("selected");
        }

        $a.setAttribute("data-date", formattedDay);

        $weekRow.appendChild($dayTemplate);
      });
      $monthTemplate.querySelector("tbody").appendChild($weekRow);
    });

    return $monthTemplate;
  }

  static addEventListenersToCalendar($calendar, dayClickedHandler) {
    const $days = Array.from($calendar.querySelectorAll("a.day"));
    $days.forEach(day => day.addEventListener("click", dayClickedHandler));
  }

  dayClickedEventHandler(clickEvent) {
    const $day = clickEvent.target;
    const $calendar = $day.closest("table");
    const dayStr = $day.getAttribute("data-date");

    if (
      $day.classList.contains("disabled") ||
      $day.classList.contains("selected")
    ) {
      return;
    }

    if ($day.classList.contains("selected")) {
      $day.classList.remove("selected");
    } else {
      $calendar.querySelectorAll("a.day.selected").forEach(el => {
        el.classList.remove("selected");
      });
      $day.classList.add("selected");
    }

    const dateChangedEvent = new CustomEvent("dateChanged", {
      detail: {
        value: dayStr
      }
    });
    this.dispatchEvent(dateChangedEvent);
    this.date = dayStr;
  }

  static get observedAttributes() {
    return ["date"];
  }

  set date(val) {
    if (val) {
      const date = new Date(val);
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );
      this.setAttribute("date", format(utcDate, "yyyy-MM-dd"));

      const $dateVal = this.shadowRoot.getElementById("date-val");
      $dateVal.innerHTML = format(utcDate, "PP");

      this._date = utcDate;
    }
  }

  get date() {
    return this._date;
  }

  /* OPEN/CLOSE */

  openDatePicker() {
    this.open = true;
    this.bindBodyClose();
  }

  closeDatePicker() {
    this.open = false;
    this.dispatchEvent(new Event("datePickerClosed"));
  }

  set open(val) {
    if (typeof val !== undefined) {
      this.setAttribute("open", val);
    }
  }

  get open() {
    return this.getAttribute("open") || null;
  }

  /*
    If the element clicked is inside a date-picker, don't close.
  */
  // eslint-disable-next-line class-methods-use-this
  shouldClose(event) {
    const path = event.composedPath();
    let shouldClose = true;
    path.forEach(function(pathElem) {
      if (pathElem.nodeName === "DATE-PICKER") {
        shouldClose = false;
      }
    });
    return shouldClose;
  }

  /*
    This method binds an event listner to the body
    whenever a date-picker is opened. It only fires once
    via the ONCE: TRUE property. If the click is supposed
    to close the date-picker, it will. Otherwise, it re-
    attaches the event listener to the body and tries again.
  */
  // prettier-ignore
  bindBodyClose() {
    document.body.addEventListener("click", e => {
      if (this.shouldClose(e)) {
        this.closeDatePicker();
      } else {
        this.bindBodyClose();
      }
    }, {
      capture: true,
      once: true
    });
  }
}

export { DatePickerElement };
