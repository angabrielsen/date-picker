export default function() {
  const schema = {
    name: "Date Picker",
    description: `A dynamic, single-day date picker, powered by love.`,
    node: "date-picker",
    categories: ["Basic"],
    props: {
      date: {
        name: "Starting Date",
        description: "Choose a starting date in YYYY-MM-DD format",
        category: "Basic",
        field: "text input",
        value: "",
        placeholder: "Enter a date in YYYY-MM-DD format",
        default: "",
        required: false
      },
      size: {
        name: "Size",
        description: "Size the Date Picker and its Calendar component.",
        category: "Basic",
        field: "select-menu",
        required: false,
        selected: "",
        default: "large",
        values: [
          {
            name: "large",
            description: "48px tall."
          },
          {
            name: "small",
            description: "36px tall."
          }
        ]
      },
      align: {
        name: "Alignment",
        description: "Align the calendar flyout inside its Date Picker.",
        category: "Basic",
        field: "select-menu",
        required: false,
        selected: "",
        default: "left",
        values: [
          {
            name: "left",
            description: "Align Calendar to the left."
          },
          {
            name: "center",
            description: "Center-justify Calendar."
          },
          {
            name: "right",
            description: "Align Calendar to the right."
          }
        ]
      }
      // months: {
      //   name: "Months to Display",
      //   description:
      //     "The number of months to display in the Calendar component.",
      //   field: "number input",
      //   max: 3,
      //   min: 1,
      //   step: 1,
      //   value: 1,
      //   required: false,
      //   active: false
      // }
    },
    eventLog: {
      dateChanged: "Fires when the selected date changes."
    }
  };
  return schema;
}
