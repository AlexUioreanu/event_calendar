import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

const OutlinedTextField: React.FC<TextFieldProps> = ({
  label,
  color,
  ...props
}) => {
  return (
    <TextField
      label={label}
      {...props}
      InputLabelProps={{
        style: { color: `${color}` },
        ...props.InputLabelProps,
      }}
      InputProps={{
        style: { color: `${color}` },
        ...props.InputProps,
      }}
      sx={{
        "& label": { color: `${color}` },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: `${color}` },
          "&:hover fieldset": { borderColor: `${color}` },
          "&.Mui-focused fieldset": { borderColor: `${color}` },
        },
        ...props.sx,
      }}
    />
  );
};

export default OutlinedTextField;
