export interface Video {
  _id: string;
  fieldId: string;
  s3Key: string;
  videoUrl?: string;
  slotId: string;
}

export interface Field {
  _id: string;
  name: string;
  type: string;
}

export interface TeamStats {
  teamName: string;
  stats: Record<string, number>;
  _id?: string;
}

export interface VideoStats {
  summary?: string;
  _id?: string;
  videoId: string;
  sportType: string;
  teams: TeamStats[];
  generatedByModel: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  statistics?: {
    summary?: string;
    sportType?: string;
    teams: TeamStats[];
  };
}

export interface S3UploadObject {
  s3Url: string;
  objectKey: string;
  uploadUrl: string;
}

export interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  value: number;
  isAvailable: boolean;
}

export interface VideoLibraryItem {
  _id: string;
  s3Key: string;
  videoUrl?: string;
  playbackUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoLibraryCreateRequest {
  s3Key?: string;
  objectKey?: string;
  videoUrl?: string;
}

export interface VideoLibraryPaginatedResponse {
  items: VideoLibraryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
