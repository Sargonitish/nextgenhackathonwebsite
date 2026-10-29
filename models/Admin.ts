import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  totpSecret: string;
  totpEnabled: boolean;
  failedAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    totpSecret: {
      type: String,
      required: true,
    },
    totpEnabled: {
      type: Boolean,
      default: false,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
