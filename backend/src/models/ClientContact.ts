
import mongoose, { Schema, Document } from 'mongoose';

// This file defines the ClientContact model for the MongoDB database.
// It includes the schema definition and the interface for type safety.
export interface IClientContact extends Document {
  clientId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientContactSchema: Schema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
}, { timestamps: true });

// Create a compound index to ensure unique client-contact pairs
ClientContactSchema.index({ clientId: 1, contactId: 1 }, { unique: true });

export default mongoose.model<IClientContact>('ClientContact', ClientContactSchema);
