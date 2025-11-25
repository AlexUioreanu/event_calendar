"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import EventModal from "../components/EventModal";
import { signOut } from "next-auth/react";

export default function Calendar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEventID, setEditingEventID] = useState(null);

  async function fetchEvents() {
    try {
      const response = await fetch(`/api/auth/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const fetchedEvents = await response.json();

        const formattedEvents: Event[] = fetchedEvents.events.map(
          (event: any) => {
            // Assume DB stores correct UTC or date value; avoid manual shifting
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            return {
              id: event.event_id,
              title: event.title,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              description: event.description,
              color: event.color,
            };
          }
        );

        setEvents(formattedEvents);
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
          padding: "2px",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#f5f5dc",
            margin: " auto",
            padding: "1rem",
            borderRadius: "3rem",
            boxShadow: " 0 0 3rem rgba(0, 0, 0, 0.6)",
          }}
        >
          <FullCalendar
            height="100%"
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
              left: "prev,next today",
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
