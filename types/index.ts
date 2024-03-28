import { Dayjs } from "dayjs";

export interface Event {
  title: string;
  start: Dayjs | null;
  end: Dayjs | null;
  description: string;
  color: string;
}
