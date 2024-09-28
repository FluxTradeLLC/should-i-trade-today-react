import React, { useMemo } from "react";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import * as dates from "./utils/dates";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const myEventsList = [
  {
    id: 1,
    title: "62.5",
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

function App() {
  const { components, defaultDate, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
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
        style={{ height: 500, width: "50%" }}
      />
    </div>
  );
}

export default App;
