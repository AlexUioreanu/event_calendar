import React, { Fragment, useEffect, useState } from "react";
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

const EventModal = ({ isOpen, onRequestClose, editingEvent }: any) => {
  const selectableColors = {
    yellow: "#fffa65",
    green: "#006400",
    red: "red",
    royalblue: "royalblue",
  };

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
  }, []);

  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [description, setDescription] = useState(
    editingEvent ? editingEvent.description : ""
  );
  const [color, setColor] = useState(
    editingEvent ? editingEvent.color : selectableColors.yellow
  );
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    editingEvent ? dayjs(editingEvent.start) : null,
    editingEvent ? dayjs(editingEvent.end) : null,
  ]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const adjustedStartDate = dateRange[0]
      ? dayjs(dateRange[0]).add(1, "day")
      : null;
    const adjustedEndDate = dateRange[1]
      ? dayjs(dateRange[1]).add(2, "day")
      : null;

    const eventPayload = {
      id: editingEvent?.id,
      title,
      description,
      color,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };

    try {
      const response = await fetch(
        editingEvent
          ? `/api/auth/events/${editingEvent.id}`
          : `/api/auth/events`,
        {
          method: editingEvent ? "PUT" : "POST",
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
        onRequestClose={onRequestClose}
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
          />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue)}
            />
          </LocalizationProvider>
          <TextField
            label="Description"
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Color"
            select
            onChange={handleColorChange}
            variant="outlined"
            SelectProps={{
              renderValue: (selected) => `${selected}`,
            }}
            sx={{
              mt: 2,
              backgroundColor: color,
            }}
          >
            {Object.entries(selectableColors).map(([colorName, colorValue]) => (
              <MenuItem
                key={colorName}
                value={colorName}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "3px",
                    backgroundColor: colorValue,
                  }}
                />
                {colorName}
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
