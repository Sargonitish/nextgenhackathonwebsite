import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICoordinator {
  _id?: Types.ObjectId | string;
  name: string;
  role: string;
  type: 'faculty' | 'student';
  photoUrl?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  order: number;
}

export interface ITrack {
  _id?: Types.ObjectId | string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface IScheduleItem {
  _id?: Types.ObjectId | string;
  day: string;
  time: string;
  title: string;
  description: string;
  order: number;
}

export interface IPrize {
  _id?: Types.ObjectId | string;
  position: string;
  title: string;
  amount: string;
  perks?: string;
  order: number;
}

export interface ISponsor {
  _id?: Types.ObjectId | string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: string;
  order: number;
}

export interface IGalleryItem {
  _id?: Types.ObjectId | string;
  imageUrl: string;
  caption?: string;
  order: number;
}

export interface IFaqItem {
  _id?: Types.ObjectId | string;
  question: string;
  answer: string;
  order: number;
}

export interface IEvent extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  isArchived: boolean;
  teamIdPrefix: string;
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    accentColor: string;
    sections: {
      hero: boolean;
      about: boolean;
      tracks: boolean;
      schedule: boolean;
      prizes: boolean;
      rules: boolean;
      coordinators: boolean;
      organizers: boolean;
      sponsors: boolean;
      gallery: boolean;
      faq: boolean;
      venue: boolean;
      contact: boolean;
    };
  };
  content: {
    heroTitle: string;
    heroTagline: string;
    typingWords: string[];
    aboutTitle: string;
    aboutText: string;
    rulesText: string;
    venueName: string;
    venueAddress: string;
    mapEmbedUrl?: string;
    contactEmail: string;
    contactPhone: string;
    socials: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
      whatsapp?: string;
    };
  };
  timer: {
    scheduledStart: Date | null;
    durationMs: number;
    status: 'not_started' | 'running' | 'paused' | 'ended';
    startedAt: Date | null;
    pausedAt: Date | null;
    totalPausedMs: number;
  };
  settings: {
    registrationOpen: boolean;
    registrationDeadline: Date | null;
    maxTeams: number | null;
    minTeamSize: number;
    maxTeamSize: number;
    organizerSignupOpen: boolean;
    organizerSignupCode: string | null;
  };
  coordinators: ICoordinator[];
  tracks: ITrack[];
  schedule: IScheduleItem[];
  prizes: IPrize[];
  sponsors: ISponsor[];
  gallery: IGalleryItem[];
  faqs: IFaqItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatorSchema = new Schema<ICoordinator>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['faculty', 'student'], required: true },
  photoUrl: { type: String },
  phone: { type: String },
  email: { type: String },
  linkedin: { type: String },
  order: { type: Number, default: 0 },
});

const TrackSchema = new Schema<ITrack>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true, default: 'Code' },
  order: { type: Number, default: 0 },
});

const ScheduleSchema = new Schema<IScheduleItem>({
  day: { type: String, required: true },
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const PrizeSchema = new Schema<IPrize>({
  position: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: String, required: true },
  perks: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const SponsorSchema = new Schema<ISponsor>({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  website: { type: String },
  tier: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
});

const GallerySchema = new Schema<IGalleryItem>({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  order: { type: Number, default: 0 },
});

const FaqSchema = new Schema<IFaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    teamIdPrefix: { type: String, required: true, uppercase: true, default: 'HACKX' },
    branding: {
      logoUrl: { type: String },
      faviconUrl: { type: String },
      primaryColor: { type: String, default: '#00ff9d' },
      accentColor: { type: String, default: '#7c3aed' },
      sections: {
        hero: { type: Boolean, default: true },
        about: { type: Boolean, default: true },
        tracks: { type: Boolean, default: true },
        schedule: { type: Boolean, default: true },
        prizes: { type: Boolean, default: true },
        rules: { type: Boolean, default: true },
        coordinators: { type: Boolean, default: true },
        organizers: { type: Boolean, default: true },
        sponsors: { type: Boolean, default: true },
        gallery: { type: Boolean, default: true },
        faq: { type: Boolean, default: true },
        venue: { type: Boolean, default: true },
        contact: { type: Boolean, default: true },
      },
    },
    content: {
      heroTitle: { type: String, default: 'HACKX 2026' },
      heroTagline: { type: String, default: '24 Hours of Code, Innovation & Building' },
      typingWords: { type: [String], default: ['Build', 'Innovate', 'Disrupt', 'Ship'] },
      aboutTitle: { type: String, default: 'About HackX' },
      aboutText: { type: String, default: 'HackX is the premier 24-hour inter-college hackathon bringing together sharp developers and designers.' },
      rulesText: { type: String, default: '### General Rules\n- Teams must consist of 2 to 4 members.\n- All code must be written during the 24 hours of the hackathon.' },
      venueName: { type: String, default: 'Campus Auditorium, Tech Campus' },
      venueAddress: { type: String, default: 'College Road, Tech City, India' },
      mapEmbedUrl: { type: String, default: '' },
      contactEmail: { type: String, default: 'hackathon@college.edu' },
      contactPhone: { type: String, default: '+91 9876543210' },
      socials: {
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
      },
    },
    timer: {
      scheduledStart: { type: Date, default: null },
      durationMs: { type: Number, default: 86400000 },
      status: {
        type: String,
        enum: ['not_started', 'running', 'paused', 'ended'],
        default: 'not_started',
      },
      startedAt: { type: Date, default: null },
      pausedAt: { type: Date, default: null },
      totalPausedMs: { type: Number, default: 0 },
    },
    settings: {
      registrationOpen: { type: Boolean, default: true },
      registrationDeadline: { type: Date, default: null },
      maxTeams: { type: Number, default: null },
      minTeamSize: { type: Number, default: 2 },
      maxTeamSize: { type: Number, default: 4 },
      organizerSignupOpen: { type: Boolean, default: true },
      organizerSignupCode: { type: String, default: null },
    },
    coordinators: [CoordinatorSchema],
    tracks: [TrackSchema],
    schedule: [ScheduleSchema],
    prizes: [PrizeSchema],
    sponsors: [SponsorSchema],
    gallery: [GallerySchema],
    faqs: [FaqSchema],
  },
  {
    timestamps: true,
  }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
