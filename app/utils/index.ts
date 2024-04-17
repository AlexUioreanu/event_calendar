export const whiteButtonOutlineStyles = {
  "& label.Mui-focused": {
    color: "#A66914",
  },
  "& label": {
    color: "#A66914",
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "& fieldset": {
      borderColor: "transparent",
    },
    backgroundColor: "#F3F3F3",
    borderRadius: "25px",
  },
  "& .MuiOutlinedInput-input": {
    color: "#A66914",
  },
  "& .MuiInput-underline:before": {
    borderBottom: "1px solid #A66914",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "2px solid #A66914",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "2px solid #A66914",
  },
};

export const simpleFieldStyle = {
  "& label.Mui-focused": {
    color: "#A66914", // Brown when focused
  },
  "& .MuiInputLabel-outlined": {
    color: "#A66914", // Light brown for placeholder and label
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#835514", // Default border color
    },
    "&:hover fieldset": {
      borderColor: "#A66914", // Darker brown on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#A66914", // Darker brown when focused
    },
    "& input::placeholder": {
      color: "#A66914", // Light brown placeholder
      opacity: 1, // Ensure placeholder is fully visible
    },
  },
};
