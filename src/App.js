import React, { useMemo, useEffect, useState } from "react";
import ReactDOM from "react-dom";

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
  const [showModal, setShowModal] = useState(false);

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

  const infoIconStyle = {
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "4px",
    opacity: 0.8,
  };

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
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  };

  const modalHeaderStyle = {
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "15px",
  };

  const modalTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#333",
  };

  const modalDateStyle = {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  };

  const modalContentStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
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
    color: "#666",
  };

  return (
    <>
      <div style={eventStyle}>
        <span>{event.title}</span>
        {event.summary && (
          <span
            style={infoIconStyle}
            onClick={() => setShowModal(true)}
            title="Click for details"
          >
            ℹ️
          </span>
        )}
      </div>
      
      {showModal && event.summary && ReactDOM.createPortal(
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              style={closeButtonStyle}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Trading Recommendation</h3>
              <p style={modalDateStyle}>
                {moment(event.start).format('dddd, MMMM Do, YYYY')}
              </p>
            </div>
            <div style={modalContentStyle}>
              {event.summary}
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}
    </>
  );
};

function App() {
  const [events, setEvents] = useState([]);
  const [todaysDate] = useState(new Date());
  const [isWeekend] = useState(new Date().getDay() % 6 === 0);
  const [todaysEvent, setTodaysEvent] = useState(null);
  const [showTodayModal, setShowTodayModal] = useState(false);

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
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  };

  const modalHeaderStyle = {
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "15px",
  };

  const modalTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#333",
  };

  const modalDateStyle = {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  };

  const modalContentStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
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
    color: "#666",
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
  };

  return (
    <div className="App dark-mode">
      {isWeekend ? (
        <div style={titleContainerStyle}>
          <h1 className="weekend">enjoy the weekend!</h1>
        </div>
      ) : todaysEvent ? (
        <div style={titleContainerStyle}>
          {todaysEvent.score >= 80 ? (
            <h1 className="yes">go for it</h1>
          ) : 
            todaysEvent.score >= 70 ?
          ( <h1 className="maybe">proceed with caution</h1> ) 
          : (
            <h1 className="no">probably not</h1>
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
        <h1>No recommendation yet</h1>
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
      />
    </div>
  );
}

export default App;
