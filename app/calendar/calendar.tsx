"use client";
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import EventModal from "../components/EventModal";
import { signOut } from "next-auth/react";

// Add one day to a YYYY-MM-DD date string and return new YYYY-MM-DD
function addOneDay(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return dateStr;
  const date = new Date(Date.UTC(y as number, (m as number) - 1, d as number));
  date.setUTCDate(date.getUTCDate() + 1);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Normalize a DB or API value to a 'YYYY-MM-DD' string
function toDateOnlyString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (value.includes("T") && value.length >= 10) return value.slice(0, 10);
  }
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return null;
}

export default function Calendar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  // Use a loose type to avoid DOM Event conflicts and allow FullCalendar event input
  const [events, setEvents] = useState<any[]>([]);
  const [editingEventID, setEditingEventID] = useState(null);
  const calendarRef = useRef<any>(null);

  async function fetchEvents() {
    try {
      const response = await fetch(`/api/auth/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const payload = await response.json();
        // Support multiple API shapes: {events}, {data:{events}}, or raw array
        const rows: any[] = payload?.data?.events ?? payload?.events ?? (Array.isArray(payload) ? payload : []);

        const formattedEvents = rows
          .map((row: any) => {
            const rawStart = row.start_date ?? row.start;
            const rawEnd = row.end_date ?? row.end ?? rawStart;
            const startDateOnly = toDateOnlyString(rawStart);
            const endDateOnly = toDateOnlyString(rawEnd);
            if (!startDateOnly || !endDateOnly) return null;
            // Retrieval policy: show +1 day
            const displayStart = addOneDay(startDateOnly);
            const displayEndInclusive = addOneDay(endDateOnly);
            const isSingleDay = startDateOnly === endDateOnly;
            const exclusiveEnd = isSingleDay ? undefined : addOneDay(displayEndInclusive);
            return {
              id: row.event_id ?? row.id,
              title: row.title || "(untitled)",
              start: displayStart,
              end: exclusiveEnd,
              description: row.description ?? "",
              color: row.color,
              allDay: true,
            };
          })
          .filter(Boolean);

        setEvents(formattedEvents as any[]);
      } else {
        console.error("Error updating events:", await response.json());
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [modalOpen]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setModalOpen(true);
  };

  function handleEventClick(event: any) {
    setEditingEventID(event.id);
    setModalOpen(true);
  }

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEventID(null);
  };

  async function handleDeleteEvent(eventInfo: any) {
    try {
      const response = await fetch(`/api/auth/events/`, {
        method: "DELETE",
        body: JSON.stringify({ eventId: eventInfo.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Event deleted successfully");
        fetchEvents();
      } else {
        console.error("Failed to delete event:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  }

  function renderEventContent(eventInfo: any) {
    return (
      <div
        className="event-hoverable event-card"
        style={{
          width: "100%",
          position: "relative",
          borderRadius: "4px",
          fontSize: "10px",
          display: "flex",
          alignItems: "center",
          margin: 0,
          padding: "0px",
          backgroundColor: eventInfo.event.backgroundColor || "#A52A2A",
          justifyContent: "space-between",
        }}
      >
        {eventInfo.event.title}
        {eventInfo.event.title === "." && (
          <span
            style={{
              cursor: "pointer",
              color: "black",
              paddingRight: "8px",
              paddingLeft: "8px",
              borderRadius: "20%",
              transition: "background-color 0.3s",
              opacity: "1",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "lightgrey")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(eventInfo.event);
            }}
          >
            X
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* Overall calendar background */
          .fc {
            background-color: #f5f5dc; /* Beige background for softer appearance */
          }

          /* Text color for the day numbers, day headers, and title */
          .fc .fc-daygrid-day-number, .fc .fc-col-header-cell, .fc-toolbar-title {
            color: #A66914; /* SaddleBrown for good contrast and readability */
          }

          /* Border color for the day cells and headers */
          .fc .fc-daygrid-day, .fc .fc-col-header-cell {
            border-color: #A66914; /* SaddleBrown to maintain the theme */
          }

          .fc .fc-more-link {
  background-color: #A66914; /* dark brown */
  color: white; /* text color */
}

.fc .fc-daygrid-event {
  marginBottom: 0px; /* Add space around events */
  padding: 0px; /* Add space inside the event element */
   display: flex; /* This will make the contents of the event flex items */
  flex-direction: column; 
}

/* Adjust hover state if needed */
.fc .fc-more-link:hover {
  background-color: #835514; /* slightly lighter brown */
}

            .fc .fc-button-primary:hover {
        background-color: #835514; /* Darker brown on hover */
        color: white;
      }

          .fc-button-group .fc-button { /* Adjust class names as needed */
  background-color: #A66914;
  color: white; /* Adjust text color for contrast */
  border: none; /* Remove default border if present */
}

.calendar-container .fc-view-container { /* Assuming a calendar-container class */
  border: 1px solid brown;
}

 .fc-popover {
      background-color: #A66914 !important; /* Darker brown for the modal */
      color: white !important; /* White text for readability */
      border-color: #835514 !important; /* Border color for the modal */
    }

    .fc-popover .fc-header-toolbar {
      background-color: #A66914 !important; /* Darker brown for the modal header */
    }

    .fc-popover .fc-scroller {
      scrollbar-color: #835514 #f5f5dc; /* Custom scrollbar colors */
    }

    .fc-event.fc-event-green, /* Adjust class names as needed */
.fc-event.fc-event-blue, 

    .fc-event {
  margin: 0;
}

.fc .fc-daygrid-event-harness, .fc .fc-daygrid-event-harness a {
   margin-bottom: 0;
      // margin-top: -3px;
   padding-top: 0;
  //  bottom: 0 !important; /* Ensuring the event sticks to the top */
}

.fc .fc-daygrid-day-events {
  padding-bottom: 0;
  margin-bottom: 0px;
  margin-top: -8.5px;
  // height: 100%;
}

.fc .fc-daygrid-day-number {
      font-size: 11px; /* Adjust this value as needed to make the date number smaller */
    }

// .fc .fc-daygrid-day .fc-daygrid-day-events .fc-daygrid-event-harness {
//   top: 0 !important;
// }
        `}
      </style>
      <div
        style={{
          backgroundColor: " rgb(243, 224, 200)",
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#f5f5dc",
            margin: 0,
            padding: 0,
            borderRadius: 0,
            boxShadow: "none",
          }}
        >
          <FullCalendar
            ref={calendarRef}
            height="100vh"
            handleWindowResize={true}
            dayCellContent={(e) => e.dayNumberText}
            dateClick={handleDateClick}
            firstDay={1}
            eventClick={(event) => handleEventClick(event.event)}
            plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
            initialView="dayGridMonth"
            events={events}
            showNonCurrentDates={false}
            selectable={true}
            selectMirror={true}
            headerToolbar={{
              left: "prevYear,prev,next,nextYear today",
              center: "title",
              right: "logoutButton",
            }}
            eventContent={renderEventContent}
            editable={false}
            dayMaxEvents={true}
            customButtons={{
              logoutButton: {
                text: "Logout",
                click: () => {
                  signOut();
                },
              },
              prevYear: {
                text: "«",
                click: () => {
                  const api = calendarRef.current?.getApi?.() ?? calendarRef.current;
                  api?.prevYear?.();
                },
              },
              nextYear: {
                text: "»",
                click: () => {
                  const api = calendarRef.current?.getApi?.() ?? calendarRef.current;
                  api?.nextYear?.();
                },
              },
            }}
          />
          <EventModal
            isOpen={modalOpen}
            onRequestClose={handleModalClose}
            date={selectedDate}
            editingEventID={editingEventID}
            args={selectedDate}
          />
        </div>
      </div>
    </>
  );
}
