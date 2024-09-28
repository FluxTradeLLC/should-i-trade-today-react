import React, { useMemo } from "react";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import * as dates from "./utils/dates";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const myEventsList = [
  {
    id: 1,
    title: 62.5,
    start: new Date(2024, 8, 27),
    end: new Date(2024, 8, 27),
  },
];

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: "lightblue",
    },
  });

const CustomEvent = ({ event }) => {
  const eventStyle = {
    backgroundColor: event.title > 60 ? "green" : "red",
    color: "white",
    borderRadius: "5px",
    padding: "2px 5px",
  };

  return <div style={eventStyle}>{event.title}</div>;
};

const customSlotPropGetter = (date) => {
  if (date.getDate() === 7 || date.getDate() === 15)
    return {
      // className: styles.specialDay,
    };
  else return {};
};

function App() {
  const { components, defaultDate, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
        event: CustomEvent,
      },
      defaultDate: new Date(2015, 3, 1),
      max: dates.add(dates.endOf(new Date(2015, 17, 1), "day"), -1, "hours"),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  return (
    <div className="App">
      <Calendar
        components={components}
        defaultDate={defaultDate}
        events={myEventsList}
        localizer={localizer}
        max={max}
        showMultiDayTimes
        step={60}
        views={views}
        defaultView={Views.AGENDA}
        slotPropGetter={customSlotPropGetter}
        style={{ height: 500, width: "50%" }}
      />
    </div>
  );
}

export default App;
