export interface Field {
  _id: string;
  name: string;
  type: string;
  location: FieldLocation;
  pricePerHour: number;
  imageUrl: string;
}

export interface FieldLocation {
  name: string;
  lat: number;
  long: number;
}

