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
