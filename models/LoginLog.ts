import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoginLog extends Document {
  username: string;
  role: 'admin' | 'organizer';
  ip: string;
  userAgent: string;
  success: boolean;
  reason: string | null;
  createdAt: Date;
}

const LoginLogSchema = new Schema<ILoginLog>(
  {
    username: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'organizer'], required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    success: { type: Boolean, required: true },
    reason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

LoginLogSchema.index({ createdAt: -1 });

export const LoginLog: Model<ILoginLog> =
  mongoose.models.LoginLog || mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);

export default LoginLog;
