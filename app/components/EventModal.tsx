import React, { Fragment, useState } from "react";
import Modal from "react-modal";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import TextField from "@mui/material/TextField";
import { Box, MenuItem, styled } from "@mui/material";
import { Event } from "@/types";
import { Dayjs } from "dayjs";

const EventModal = ({ isOpen, onRequestClose }: any) => {
  const selectableColors = {
    yellow: "#fffa65",
    green: "#006400",
    red: "red",
    royalblue: "royalblue",
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(selectableColors.yellow);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const event: Event = {
      title: title,
      description: description,
      color: color,
      start: dateRange[0],
      end: dateRange[1],
    };

    try {
      const response = await fetch(`/api/auth/events`, {
        method: "PUT",
        body: JSON.stringify({ event }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("Events updated successfully");
      } else {
        console.error("Error updating events:", await response.json());
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
    onRequestClose();
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
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
          background: "grey",
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
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
  );
};

export default EventModal;
