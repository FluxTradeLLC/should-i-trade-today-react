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
    backgroundColor: event.score > 65 ? event.score < 80 ? "yellow" : "darkgreen" : "darkred",
    color: event.score < 80 && event.score >= 70 ? "black" : "white",
    borderRadius: "5px",
    padding: "2px 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "20px",
    zIndex: 2
  };

  return (
    <div style={eventStyle}>
      <span>{event.title}</span>
    </div>
  );
};

function App() {
  const [events, setEvents] = useState([]);
  const [todaysDate] = useState(new Date());
  const [isWeekend] = useState(new Date().getDay() % 6 === 0);
  const [todaysEvent, setTodaysEvent] = useState(null);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
            title: `${datum.score > 65 ? datum.score < 80 ? "cautious yes" : "yes" : "no"} (${datum.score})`,
            summary: datum.summary,
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

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle = {
    backgroundColor: "#23272f",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
    color: "#f1f1f1",
    position: "relative"
  };

  const modalHeaderStyle = {
    borderBottom: "1px solid #444",
    paddingBottom: "10px",
    marginBottom: "15px",
  };

  const modalTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#f1f1f1",
  };

  const modalDateStyle = {
    fontSize: "14px",
    color: "#aaa",
    margin: 0,
  };

  const modalContentStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#f1f1f1",
    whiteSpace: "pre-wrap",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#aaa",
    transition: "color 0.2s",
  };

  const infoIconStyle = {
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "10px",
    opacity: 0.8,
    verticalAlign: "middle",
  };

  const titleContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    fontSize: "30px"
  };

  return (
    <div className="App dark-mode">
      {isWeekend ? (
        <div style={titleContainerStyle}>
          <h3 className="weekend">enjoy the weekend!</h3>
        </div>
      ) : todaysEvent ? (
        <div style={titleContainerStyle}>
          {todaysEvent.score >= 80 ? (
            <h3 className="yes">go for it</h3>
          ) : 
            todaysEvent.score >= 70 ?
          ( <h3 className="maybe">proceed with caution</h3> ) 
          : (
            <h3 className="no">probably not</h3>
          )}
          {todaysEvent.summary && (
            <span
              style={infoIconStyle}
              onClick={() => setShowTodayModal(true)}
              title="Click for details"
            >
              ℹ️
            </span>
          )}
        </div>
      ) : (
        <h3>no recommendation yet</h3>
      )}
      
      {showTodayModal && todaysEvent?.summary && (
        <div style={modalOverlayStyle} onClick={() => setShowTodayModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              style={closeButtonStyle}
              onClick={() => setShowTodayModal(false)}
            >
              ×
            </button>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Today's Trading Recommendation</h3>
              <p style={modalDateStyle}>
                {moment(todaysEvent.start).format('dddd, MMMM Do, YYYY')}
              </p>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: 10, color: todaysEvent.score >= 80 ? 'green' : todaysEvent.score >= 70 ? 'yellow' : 'red' }}>
              {todaysEvent.title}
            </div>
            <div style={modalContentStyle}>
              {todaysEvent.summary}
            </div>
          </div>
        </div>
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
        onSelectEvent={(event) => setSelectedEvent(event)}
      />
      {selectedEvent && selectedEvent.summary && (
        <div style={modalOverlayStyle} onClick={() => setSelectedEvent(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              style={closeButtonStyle}
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Trading Recommendation</h3>
              <p style={modalDateStyle}>
                {moment(selectedEvent.start).format('dddd, MMMM Do, YYYY')}
              </p>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: 10, color: selectedEvent.score >= 80 ? 'green' : selectedEvent.score >= 70 ? 'yellow' : 'red' }}>
              {selectedEvent.title}
            </div>
            <div style={modalContentStyle}>
              {selectedEvent.summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
