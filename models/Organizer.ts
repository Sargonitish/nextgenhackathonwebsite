import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrganizerType = 'faculty' | 'student';
export type OrganizerDuty =
  | 'registration_desk'
  | 'tech_support'
  | 'hospitality'
  | 'logistics'
  | 'other';
export type OrganizerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IOrganizerPermissions {
  checkin: boolean;
  viewTeams: boolean;
  viewContacts: boolean;
}

export interface IOrganizer extends Document {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  yearOrDesignation: string;
  type: OrganizerType;
  duty: OrganizerDuty;
  note?: string;
  photoUrl?: string | null;
  username: string;
  passwordHash: string;
  status: OrganizerStatus;
  rejectReason?: string | null;
  permissions: IOrganizerPermissions;
  showOnWebsite: boolean;
  sessionVersion: number;
  failedAttempts: number;
  lockUntil: Date | null;
  submittedIp: string;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  lastLoginAt?: Date | null;
  checkinsDone: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizerSchema = new Schema<IOrganizer>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    yearOrDesignation: { type: String, required: true, trim: true },
    type: { type: String, enum: ['faculty', 'student'], required: true },
    duty: {
      type: String,
      enum: ['registration_desk', 'tech_support', 'hospitality', 'logistics', 'other'],
      required: true,
      default: 'registration_desk',
    },
    note: { type: String, default: '' },
    photoUrl: { type: String, default: null },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectReason: { type: String, default: null },
    permissions: {
      checkin: { type: Boolean, default: true },
      viewTeams: { type: Boolean, default: true },
      viewContacts: { type: Boolean, default: false },
    },
    showOnWebsite: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 0 },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    submittedIp: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    checkinsDone: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Organizer: Model<IOrganizer> =
  mongoose.models.Organizer || mongoose.model<IOrganizer>('Organizer', OrganizerSchema);

export default Organizer;
