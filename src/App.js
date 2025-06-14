import React, { useMemo, useEffect, useState } from "react";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";

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
    backgroundColor: event.score > 34 ? "green" : "red",
    color: "white",
    borderRadius: "5px",
    padding: "2px 5px",
  };

  return <div style={eventStyle}>{event.title}</div>;
};

function App() {
  const [events, setEvents] = useState([]);
  const [todaysDate, setTodaysDate] = useState(new Date());
  const [isWeekend, setIsWeekend] = useState(new Date().getDay() % 6 === 0);
  const [todaysEvent, setTodaysEvent] = useState(null);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_SERVER_BASE_URI}/get_recommendations/past_month`
    )
      .then((response) => response.json())
      .then((data) => {
        setEvents(
          data.map((datum, index) => ({
            id: index,
            score: datum.score,
            title: `${datum.score >= 34 ? "Yes" : "No"} (${datum.score})`,
            start: moment.utc(datum.date).endOf("day").toDate(),
            end: moment.utc(datum.date).endOf("day").toDate(),
          }))
        );
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
    const todayUTC = moment.utc().format("YYYY-MM-DD");
    const todaysEvent = events?.filter((event) => {
      if (event?.start) {
        const eventDate = moment.utc(event.start);
        if (eventDate.isValid()) {
          return eventDate.format("YYYY-MM-DD") === todayUTC;
        }
      }
      return false;
    });
    setTodaysEvent(todaysEvent?.[0] || null);
  }, [events, todaysDate]);

  const { components, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
        event: CustomEvent,
      },
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  return (
    <div className="App dark-mode">
      {isWeekend ? (
        <h1 className="weekend">Enjoy the weekend!</h1>
      ) : todaysEvent ? (
        todaysEvent.score >= 34 ? (
          <h1 className="yes">Go for it</h1>
        ) : (
          <h1 className="no">Probably not</h1>
        )
      ) : (
        <h1>No recommendation yet</h1>
      )}
      <Calendar
        components={components}
        events={events}
        localizer={localizer}
        max={max}
        showMultiDayTimes
        step={60}
        views={views}
        defaultView={Views.MONTH}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default App;
