import React, { useEffect, useState, useCallback } from "react";
import Modal from "react-modal";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import TextField from "@mui/material/TextField";
import { Box, MenuItem } from "@mui/material";
import { Event } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en-gb";
import { simpleFieldStyle } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventModal = ({ isOpen, onRequestClose, editingEventID, args }: any) => {
  const selectableColors = {
    yellow: "yellow",
    pink: "pink",
    lightGreen: "lightgreen",
    red: "red",
    lightblue: "lightblue",
    white: "white",
  };

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
  }, []);

  const [loading, setLoading] = useState(false);

  const [initialEvent, setInitialEvent] = useState<Event>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(selectableColors.yellow);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const fetchEvent = useCallback(async () => {
    if (editingEventID === null) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/events/${editingEventID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const fetchedEvents = await response.json();
        const formattedEvents: Event = fetchedEvents.events
          .map((event: any) => {
            // start_date/end_date are DATE columns ('YYYY-MM-DD')
            return {
              id: event.event_id,
              title: event.title,
              start: event.start_date, // keep as date-only string
              end: event.end_date, // keep as date-only string
              description: event.description,
              color: event.color,
            };
          })
          .pop();
        setInitialEvent(formattedEvents);
        setTitle(formattedEvents?.title || "");
        setDescription(formattedEvents?.description || "");
        setColor(formattedEvents?.color || selectableColors.yellow);
        setDateRange([
          formattedEvents?.start ? dayjs(formattedEvents.start) : null,
          formattedEvents?.end ? dayjs(formattedEvents.end) : null,
        ]);
        toast.success("Event details fetched successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        const errorData = await response.json();
        const serverErrorMessage =
          errorData.message || "Failed to fetch the event.";
        console.error("Error fetching event:", serverErrorMessage);
        toast.error(`Error: ${serverErrorMessage}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error fetching event:", error.message || error);
      toast.error("An unexpected error occurred while fetching the event.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [editingEventID, selectableColors.yellow]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (isOpen && args !== null) {
      setDateRange([dayjs(args), dayjs(args)]);
    }
  }, [isOpen, args]);

  // Check if fields are filled and if edits have been made
  const isFormFilled = title && description && dateRange[0] && dateRange[1];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
  // Add/edit policy: store one day in minus in DB relative to UI
  const adjustedStartDate = dateRange[0]
    ? dayjs(dateRange[0]).subtract(1, "day").format("YYYY-MM-DD")
    : null;
  const adjustedEndDate = dateRange[1]
    ? dayjs(dateRange[1]).subtract(1, "day").format("YYYY-MM-DD")
    : null;

    const eventPayload = {
  id: editingEventID,
      title,
      description,
      color,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
    try {
      setLoading(true);
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
        setLoading(false);
        toast.success(
          editingEventID
            ? "Event updated successfully!"
            : "Event added successfully!",
          { position: "bottom-center", autoClose: 3000 }
        );

        console.log("Events updated successfully");
        setTitle("");
        setDescription("");
        setColor(selectableColors.yellow);
        setDateRange([null, null]);
        onRequestClose();
      } else {
        setLoading(false);
        console.error("Error updating event");
        const errorText = await response.text();
        toast.error(errorText || "Failed to update the event.", {
          position: "top-right",
          autoClose: 3000,
        });
        setErrorMsg(
          errorText || "Unknown error occurred while updating the event."
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred while updating the event.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error updating event:", error);
      setErrorMsg("An error occurred while updating the event.");
    } finally {
      setLoading(false);
    }
  };


  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  // ---------------
  // Compare Start/End Dates
  // ---------------
  const isStartDateUnchanged = (() => {
    if (dateRange[0] && initialEvent?.start) {
      return dayjs(dateRange[0]).isSame(dayjs(initialEvent.start), "day");
    }
    return !dateRange[0] && !initialEvent?.start;
  })();

  const isEndDateUnchanged = (() => {
    if (dateRange[1] && initialEvent?.end) {
      return dayjs(dateRange[1]).isSame(dayjs(initialEvent.end), "day");
    }
    return !dateRange[1] && !initialEvent?.end;
  })();

  // ---------------
  // isUnchanged Logic
  // ---------------
  const isUnchanged =
    (title === "" || title === initialEvent?.title) &&
    description === initialEvent?.description &&
    color === initialEvent?.color &&
    isStartDateUnchanged &&
    isEndDateUnchanged;

  return (
    <>
      <style>
        {`
        
/* Spinner CSS */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #A66914;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
}
        .MuiPaper-root {
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
      <ToastContainer />
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
            borderRadius: "8px",
            outline: "none",
            padding: "24px",
            // Make the modal larger but responsive
            width: "min(800px, 90vw)",
            maxWidth: "90vw",
            maxHeight: "85vh",
            zIndex: 1001,
          },
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1002,
            }}
          >
            <div className="spinner"></div>
          </div>
        )}
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
            minRows={6}
            maxRows={18}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              style: {
                resize: "both",
                fontSize: "14px",
              },
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
            disabled={editingEventID ? isUnchanged : !isFormFilled}
            style={{
              marginTop: "20px",
              backgroundColor: (editingEventID ? isUnchanged : !isFormFilled)
                ? "#d3d3d3"
                : "#A66914",
            }}
          >
            {editingEventID ? "EDIT" : "ADD"}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default EventModal;
