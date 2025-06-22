import mongoose, { Schema, Document } from 'mongoose';

// This file defines the Client model for the MongoDB database.
// It includes the schema definition and the interface for type safety.
export interface IClient extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model<IClient>('Client', ClientSchema);