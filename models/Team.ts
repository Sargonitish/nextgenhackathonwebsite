import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITeamMember {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: number | string;
  registerNumber?: string;
  isLeader: boolean;
  present: boolean;
}

export interface ICheckedInBy {
  id: string;
  name: string;
  role: 'admin' | 'organizer';
}

export interface ITeam extends Document {
  eventId: Types.ObjectId;
  teamId: string;
  teamName: string;
  teamNameLower: string;
  track: string;
  members: ITeamMember[];
  leaderEmail: string;
  leaderGoogleId?: string;
  isGoogleVerified?: boolean;
  googleAvatar?: string;
  checkinToken: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  checkedInBy: ICheckedInBy | null;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  college: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  year: { type: Schema.Types.Mixed, required: true },
  registerNumber: { type: String, trim: true, default: '' },
  isLeader: { type: Boolean, default: false },
  present: { type: Boolean, default: false },
});

const CheckedInBySchema = new Schema<ICheckedInBy>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'organizer'], required: true },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    teamId: { type: String, required: true, uppercase: true, trim: true },
    teamName: { type: String, required: true, trim: true },
    teamNameLower: { type: String, required: true, lowercase: true, trim: true },
    track: { type: String, required: true },
    members: { type: [MemberSchema], required: true },
    leaderEmail: { type: String, required: true, lowercase: true, trim: true },
    leaderGoogleId: { type: String, default: null, trim: true },
    isGoogleVerified: { type: Boolean, default: false },
    googleAvatar: { type: String, default: null },
    checkinToken: { type: String, required: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: CheckedInBySchema, default: null },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ eventId: 1, teamNameLower: 1 }, { unique: true });
TeamSchema.index({ eventId: 1, leaderEmail: 1 }, { unique: true });
TeamSchema.index({ eventId: 1, teamId: 1 }, { unique: true });

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
