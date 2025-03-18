export interface Field {
  _id: string;
  name: string;
  type: string;
  location: {
    lat: number;
    long: number;
    name: string;
  };
  pricePerHour: number;
  imageUrl: string;
}
