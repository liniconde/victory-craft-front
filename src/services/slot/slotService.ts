import { Field } from "../field/fieldService";

export interface Slot {
  _id: string;
  field?: Field;
  startTime: string;
  endTime: string;
  value: number;
  isAvailable: boolean;
}
