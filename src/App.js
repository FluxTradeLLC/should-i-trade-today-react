import React, { useMemo, useEffect, useState } from "react";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import * as dates from "./utils/dates";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

const localizer = momentLocalizer(moment);

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

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_SERVER_BASE_URI}/get_recommendations/past_month`
    )
      .then((response) => response.json())
      .then((data) =>
        setEvents(
          data.map((datum, index) => ({
            id: index,
            title: datum.score,
            start: new Date(datum.date),
            end: new Date(datum.date),
          }))
        )
      )
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const { components, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
        event: CustomEvent,
      },
      max: dates.add(dates.endOf(new Date(2015, 17, 1), "day"), -1, "hours"),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  return (
    <div className="App">
      <Calendar
        components={components}
        events={events}
        localizer={localizer}
        max={max}
        showMultiDayTimes
        step={60}
        views={views}
        defaultView={Views.MONTH}
        style={{ height: "50%", width: "50%" }}
      />
    </div>
  );
}

export default App;
