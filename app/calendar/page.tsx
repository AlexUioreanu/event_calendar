"use client";
import React, { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import EventModal from "../components/EventModal";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEventID, setEditingEventID] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  async function fetchEvents() {
    try {
      const response = await fetch(`/api/auth/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response.ok) {
        const fetchedEvents = await response.json();
        console.log(fetchedEvents.events);

        const formattedEvents: Event[] = fetchedEvents.events.map(
          (event: any) => ({
            id: event.event_id,
            title: event.title,
            start: event.start_date,
            end: event.end_date,
            description: event.description,
            color: event.color,
          })
        );

        console.log(formattedEvents);

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
    console.log(event.id);
    setEditingEventID(event.id);
    setModalOpen(true);
  }

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEventID(null);
  };

  async function handleDeleteEvent(eventInfo: any) {
    try {
      if (eventInfo.title !== ".") {
        setDialogMessage("This event cannot be deleted.");
        setDialogOpen(true);
      } else {
        const response = await fetch(`/api/auth/events/`, {
          method: "DELETE",
          body: JSON.stringify({ eventId: eventInfo.id }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(eventInfo.title);

        if (response.ok) {
          console.log("Event deleted successfully");
          fetchEvents();
        } else {
          console.error("Failed to delete event:", await response.json());
        }
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
          padding: "5px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          margin: 0,
          backgroundColor: eventInfo.event.backgroundColor || "#A52A2A",
          justifyContent: "space-between",
        }}
      >
        {eventInfo.event.title}
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
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{ display: "flex", alignItems: "center", color: "#D32F2F" }}
        >
          <ErrorOutlineIcon style={{ marginRight: 10 }} />
          {"Error"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
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
        `}
      </style>
      <div
        style={{
          backgroundColor: " rgb(243, 224, 200)",
          height: "calc(100vh - 65px)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#f5f5dc",
            margin: " auto",
            padding: "2rem",
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
            selectable={true}
            selectMirror={true}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth",
            }}
            eventContent={renderEventContent}
            editable={false}
            dayMaxEvents={true}
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
