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

const formatTimeToAmPm = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "";
  const parts = timeString.split(":");
  if (parts.length < 2) return timeString;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minutesPadded = minutes.toString().padStart(2, "0");
  return `${hours}:${minutesPadded} ${ampm}`;
};

const impactToColor = (impact) => {
  const normalized = (impact || "").toLowerCase();
  switch (normalized) {
    case "low":
      return { bg: "#f1c40f", color: "#000" }; // yellow
    case "medium":
      return { bg: "#e67e22", color: "#fff" }; // orange
    case "high":
      return { bg: "#e74c3c", color: "#fff" }; // red
    default:
      return { bg: "#7f8c8d", color: "#fff" }; // gray fallback
  }
};

const CustomEvent = ({ event }) => {
  const eventStyle = {
    backgroundColor: event.score > 65 ? event.score < 80 ? "yellow" : "darkgreen" : "darkred",
    color: event.score < 80 && event.score >= 70 ? "black" : "white",
    borderRadius: "5px",
    padding: "2px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "24px",
    zIndex: 2,
    gap: "8px",
    flexWrap: "wrap"
  };

  const chipsContainerStyle = {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    flexWrap: "wrap"
  };

  const chips = Array.isArray(event.econEvents) ? event.econEvents : [];

  return (
    <div style={eventStyle}>
      <span>{event.title}</span>
      {chips.length > 0 && (
        <div style={chipsContainerStyle}>
          {chips.map((ev, idx) => {
            const { bg, color } = impactToColor(ev?.impact);
            const label = formatTimeToAmPm(ev?.time_eastern);
            const chipStyle = {
              backgroundColor: bg,
              color,
              borderRadius: "9999px",
              padding: "1px 8px",
              fontSize: "11px",
              lineHeight: 1.8,
              whiteSpace: "nowrap",
              cursor: ev?.description ? "help" : "default"
            };
            return (
              <span key={idx} title={ev?.description || ""} style={chipStyle}>
                {label}
              </span>
            );
          })}
        </div>
      )}
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
            regime: datum.regime,
            supportingFactors: Array.isArray(datum.supporting_factors) ? datum.supporting_factors : [],
            contradictoryFactors: Array.isArray(datum.contradictory_factors) ? datum.contradictory_factors : [],
            signalAccuracyRecent: typeof datum.signal_accuracy_recent === "number" ? datum.signal_accuracy_recent : null,
            econEvents: Array.isArray(datum.events) ? datum.events : [],
            numHighImpactEvents: typeof datum.num_high_impact_events === "number" ? datum.num_high_impact_events : null,
            start: moment.utc(datum.date).endOf("day").toDate(),
            end: moment.utc(datum.date).endOf("day").toDate(),
          }))
        );
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showTodayModal) setShowTodayModal(false);
        if (selectedEvent) setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTodayModal, selectedEvent]);

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

  const hasEventDetails = (ev) => {
    if (!ev) return false;
    const hasFactors = (Array.isArray(ev.supportingFactors) && ev.supportingFactors.length > 0) || (Array.isArray(ev.contradictoryFactors) && ev.contradictoryFactors.length > 0);
    const hasEcon = Array.isArray(ev.econEvents) && ev.econEvents.length > 0;
    const hasRegime = !!ev.regime;
    const hasAccuracy = typeof ev.signalAccuracyRecent === "number";
    const hasSummary = !!ev.summary;
    return hasFactors || hasEcon || hasRegime || hasAccuracy || hasSummary;
  };

  const sectionHeaderStyle = { fontWeight: "bold", marginTop: 12, marginBottom: 6, color: "#ddd" };
  const listStyle = { paddingLeft: 18, marginTop: 4, marginBottom: 8 };

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
          {hasEventDetails(todaysEvent) && (
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
      
      {showTodayModal && hasEventDetails(todaysEvent) && (
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
              {todaysEvent.summary && (
                <div style={{ marginBottom: 8 }}>{todaysEvent.summary}</div>
              )}
              {todaysEvent.regime && (
                <div>
                  <div style={sectionHeaderStyle}>Regime</div>
                  <div>{todaysEvent.regime}</div>
                </div>
              )}
              {Array.isArray(todaysEvent.supportingFactors) && todaysEvent.supportingFactors.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Supporting factors</div>
                  <ul style={listStyle}>
                    {todaysEvent.supportingFactors.map((f, i) => (
                      <li key={`sf-${i}`}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(todaysEvent.contradictoryFactors) && todaysEvent.contradictoryFactors.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Contradictory factors</div>
                  <ul style={listStyle}>
                    {todaysEvent.contradictoryFactors.map((f, i) => (
                      <li key={`cf-${i}`}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {typeof todaysEvent.signalAccuracyRecent === 'number' && (
                <div>
                  <div style={sectionHeaderStyle}>Signal accuracy (recent)</div>
                  <div>{Math.round(todaysEvent.signalAccuracyRecent * 100)}%</div>
                </div>
              )}
              {typeof todaysEvent.numHighImpactEvents === 'number' && (
                <div>
                  <div style={sectionHeaderStyle}>High impact events</div>
                  <div>{todaysEvent.numHighImpactEvents}</div>
                </div>
              )}
              {Array.isArray(todaysEvent.econEvents) && todaysEvent.econEvents.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Events</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {todaysEvent.econEvents.map((ev, idx) => {
                      const { bg, color } = impactToColor(ev?.impact);
                      const label = formatTimeToAmPm(ev?.time_eastern);
                      return (
                        <span key={`tev-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span title={ev?.description || ''} style={{ backgroundColor: bg, color, borderRadius: '9999px', padding: '2px 10px', fontSize: 12 }}>
                            {label}
                          </span>
                          {ev?.description && (
                            <span style={{ fontSize: 12, color: '#ddd' }}>{ev.description}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
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
      {selectedEvent && hasEventDetails(selectedEvent) && (
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
              {selectedEvent.summary && (
                <div style={{ marginBottom: 8 }}>{selectedEvent.summary}</div>
              )}
              {selectedEvent.regime && (
                <div>
                  <div style={sectionHeaderStyle}>Regime</div>
                  <div>{selectedEvent.regime}</div>
                </div>
              )}
              {Array.isArray(selectedEvent.supportingFactors) && selectedEvent.supportingFactors.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Supporting factors</div>
                  <ul style={listStyle}>
                    {selectedEvent.supportingFactors.map((f, i) => (
                      <li key={`sfm-${i}`}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(selectedEvent.contradictoryFactors) && selectedEvent.contradictoryFactors.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Contradictory factors</div>
                  <ul style={listStyle}>
                    {selectedEvent.contradictoryFactors.map((f, i) => (
                      <li key={`cfm-${i}`}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {typeof selectedEvent.signalAccuracyRecent === 'number' && (
                <div>
                  <div style={sectionHeaderStyle}>Signal accuracy (recent)</div>
                  <div>{Math.round(selectedEvent.signalAccuracyRecent * 100)}%</div>
                </div>
              )}
              {typeof selectedEvent.numHighImpactEvents === 'number' && (
                <div>
                  <div style={sectionHeaderStyle}>High impact events</div>
                  <div>{selectedEvent.numHighImpactEvents}</div>
                </div>
              )}
              {Array.isArray(selectedEvent.econEvents) && selectedEvent.econEvents.length > 0 && (
                <div>
                  <div style={sectionHeaderStyle}>Events</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedEvent.econEvents.map((ev, idx) => {
                      const { bg, color } = impactToColor(ev?.impact);
                      const label = formatTimeToAmPm(ev?.time_eastern);
                      return (
                        <span key={`sev-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span title={ev?.description || ''} style={{ backgroundColor: bg, color, borderRadius: '9999px', padding: '2px 10px', fontSize: 12 }}>
                            {label}
                          </span>
                          {ev?.description && (
                            <span style={{ fontSize: 12, color: '#ddd' }}>{ev.description}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <p className="text-center mt-12">Copyright &copy; {new Date().getFullYear()}, <a href="https://fluxtrade.net" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>FluxTrade, LLC</a>. All rights reserved.</p>
    </div>
  );
}

export default App;
