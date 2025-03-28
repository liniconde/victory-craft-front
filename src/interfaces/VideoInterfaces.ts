// 📌 Tipado del objeto Video
export interface Video {
  _id: string;
  fieldId: string;
  s3Key: string;
  videoUrl?: string;
  slotId: string;
}
