"use client";
import React, { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import EventModal from "../components/EventModal";

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState<Event[]>([]);

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

  console.log(events);
  useEffect(() => {
    fetchEvents();
  }, [modalOpen]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setModalOpen(true);
  };

  function handleEventClick() {
    throw new Error("Function not implemented.");
  }

  // const handleEventSubmit = (newEvent: any) => {
  //   setEvents((currentEvents) => [
  //     ...currentEvents,
  //     {
  //       title: newEvent.title,
  //       start: newEvent.date,
  //       end: newEvent.date,
  //       allDay: true,
  //       color: newEvent.color,
  //       description: newEvent.description,
  //     },
  //   ]);
  //   setModalOpen(false);
  // };

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

          /* Background and text color for event elements */
          .fc .fc-event {
            background-color: #A52A2A; /* Brown background for events */
            color: white; /* White text for contrast */
            border: 1px solid #A66914; /* SaddleBrown border for distinction */
          }
          
          /* Hover effect for event elements */
          .fc .fc-event:hover {
            background-color: #A66914; /* Darker brown on hover for interactivity */
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
            eventClick={() => {
              handleEventClick();
            }}
            plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
            initialView="dayGridMonth"
            events={events}
            selectable={true}
            selectMirror={true}
            // select={handleSelect}
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
            onRequestClose={() => setModalOpen(false)}
            date={selectedDate}
          />
        </div>
      </div>
    </>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="event-hoverable event-card">{eventInfo.event.title}</div>
  );
}
