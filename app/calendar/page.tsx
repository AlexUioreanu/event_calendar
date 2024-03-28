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
    <div style={{ backgroundColor: "GrayText" }}>
      <FullCalendar
        dayCellContent={(e) => e.dayNumberText}
        dateClick={handleDateClick}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          rrulePlugin,
        ]}
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
        editable={true}
        dayMaxEvents={true}
      />
      <EventModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <>
      <i>{eventInfo.event.title}</i>
    </>
  );
}
