import { Field } from "./FieldInterfaces";

export interface Slot {
  _id: string;
  field?: Field;
  startTime: string;
  endTime: string;
  value: number;
  isAvailable: boolean;
}
