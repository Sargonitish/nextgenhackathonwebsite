import connectDB from './db';
import Event, { IEvent } from '@/models/Event';

export async function getActiveEvent(): Promise<IEvent | null> {
  await connectDB();
  const event = await Event.findOne({ isActive: true, isArchived: false }).lean<IEvent>();
  return event;
}

export default getActiveEvent;
