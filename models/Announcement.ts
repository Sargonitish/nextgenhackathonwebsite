import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  eventId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
