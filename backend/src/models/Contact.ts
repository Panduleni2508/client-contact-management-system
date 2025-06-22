import mongoose, { Schema, Document } from 'mongoose';

// This file defines the Contact model for the MongoDB database.
// It includes the schema definition and the interface for type safety.
export interface IContact extends Document {
  name: string;
  surname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model<IContact>('Contact', ContactSchema);