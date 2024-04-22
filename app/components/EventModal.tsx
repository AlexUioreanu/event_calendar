import React, { Fragment, use, useEffect, useState } from "react";
import Modal from "react-modal";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import TextField from "@mui/material/TextField";
import { Box, MenuItem, styled } from "@mui/material";
import { Event } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en-gb";
import { simpleFieldStyle } from "../utils";

const EventModal = ({ isOpen, onRequestClose, editingEventID, args }: any) => {
  console.log(args);
  const selectableColors = {
    yellow: "yellow",
    pink: "pink",
    lightGreen: "lightgreen",
    red: "red",
    blue: "lightblue",
    white: "white",
  };

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(selectableColors.yellow);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    if (editingEventID !== null) {
      fetchEvent();
    }
  }, [editingEventID]);

  useEffect(() => {
    if (args !== null) {
      setDateRange([dayjs(args), dayjs(args)]);
    }
  }, [args]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    var adjustedStartDate;
    var adjustedEndDate;
    if (editingEventID !== null) {
      adjustedStartDate = dateRange[0]
        ? dayjs(dateRange[0]).subtract(1, "day")
        : null;
      adjustedEndDate = dateRange[1]
        ? dayjs(dateRange[1]).subtract(1, "day")
        : null;
    } else {
      adjustedStartDate = dateRange[0]
        ? dayjs(dateRange[0]).add(0, "day")
        : null;
      adjustedEndDate = dateRange[1] ? dayjs(dateRange[1]).add(0, "day") : null;
    }

    console.log(dateRange[0]);
    console.log(dateRange[1]);

    const eventPayload = {
      id: editingEventID?.id,
      title,
      description,
      color,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
    console.log(editingEventID ? "PUT" : "POST");
    console.log(editingEventID);
    try {
      const response = await fetch(
        editingEventID
          ? `/api/auth/events/${editingEventID}`
          : `/api/auth/events`,
        {
          method: editingEventID ? "PUT" : "POST",
          body: JSON.stringify({ event: eventPayload }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        console.log("Events updated successfully");
        setTitle("");
        setDescription("");
        setColor(selectableColors.yellow);
        setDateRange([null, null]);
        onRequestClose();
      } else {
        console.error("Error updating event");
        const errorText = await response.text();
        setErrorMsg(
          errorText || "Unknown error occurred while updating the event."
        );
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setErrorMsg("An error occurred while updating the event.");
    }
  };

  async function fetchEvent() {
    try {
      const response = await fetch(`/api/auth/events/${editingEventID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response.ok) {
        const fetchedEvents = await response.json();

        const formattedEvents: Event = fetchedEvents.events
          .map((event: any) => {
            // Parse the start and end dates from the event
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            // Add one day to the start date
            startDate.setDate(startDate.getDate() + 0);

            // Add one day to the end date
            endDate.setDate(endDate.getDate() + 0);

            // Convert the dates back to strings or your desired format
            return {
              id: event.event_id,
              title: event.title,
              start: startDate.toISOString(), // Assuming the dates need to be in ISO format
              end: endDate.toISOString(),
              description: event.description,
              color: event.color,
            };
          })
          .pop();

        console.log(formattedEvents);

        setTitle(formattedEvents?.title || "");
        setDescription(formattedEvents?.description || "");
        setColor(formattedEvents?.color || selectableColors.yellow);
        setDateRange([
          formattedEvents?.start
            ? dayjs(formattedEvents?.start).add(1, "day")
            : null,
          formattedEvents.end ? dayjs(formattedEvents.end).add(1, "day") : null,
        ]);
      } else {
        console.error("Error updating events:", await response.json());
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  }

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <>
      <style>
        {`.MuiPaper-root {
  background-color: rgb(245, 245, 220) !important;
  .Mui-selected {
  background-color: #A66914 !important; /* A shade of brown */
  color: white !important; /* Change text color to white for better readability */
}

/* Override the hover state color for days */
.MuiPickersDay-dayWithMargin:hover {
  background-color: #deb887 !important; /* A lighter shade of brown for hover state */
}
}`}
      </style>
      {errorMsg && (
        <Box style={{ color: "red", marginBottom: "20px" }}>{errorMsg}</Box>
      )}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => {
          onRequestClose();
          setTitle("");
          setDescription("");
          setColor(selectableColors.yellow);
          setDateRange([null, null]);
        }}
        contentLabel="Event Modal"
        style={{
          overlay: {
            position: "fixed",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1000,
          },
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid #ccc",
            backgroundColor: "rgb(245, 245, 220)",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
            zIndex: 1001,
          },
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <TextField
            label="Title"
            value={title}
            style={{ outlineColor: "#A66914" }}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            fullWidth
            sx={simpleFieldStyle}
          />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue)}
              sx={simpleFieldStyle}
            />
          </LocalizationProvider>
          <TextField
            label="Description"
            multiline
            minRows={12}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              style: { resize: "both" },
            }}
            sx={simpleFieldStyle}
          />

          <TextField
            label="Color"
            select
            onChange={handleColorChange}
            variant="outlined"
            sx={{
              mt: 2,
              backgroundColor: color,
              "& label.Mui-focused": {
                color: "#A66914",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#835514",
                },
                "&:hover fieldset": {
                  borderColor: "#A66914",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#A66914",
                },
              },
            }}
          >
            {Object.entries(selectableColors).map(([colorValue]) => (
              <MenuItem
                key={colorValue}
                value={colorValue}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 24,
                    borderRadius: "3px",
                    backgroundColor: colorValue,
                  }}
                />
              </MenuItem>
            ))}
          </TextField>
          <button
            type="submit"
            className="loginButton"
            style={{ marginTop: "20px" }}
          >
            Add Event
          </button>
        </form>
      </Modal>
    </>
  );
};

export default EventModal;
