import { Request, Response } from 'express';
import ClientContact from '../models/ClientContact';

export const linkContact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate that both clientId and contactId are provided
    const { clientId, contactId } = req.body;
    
    // Check if relationship already exists
    const existing = await ClientContact.findOne({ clientId, contactId });
    if (existing) {
      res.status(400).json({ message: 'Contact is already linked to this client' });
      return;
    }
    
    // Create new ClientContact relationship
    const clientContact = new ClientContact({ clientId, contactId });
    await clientContact.save();
    
    // Return the created relationship details
    res.status(201).json({
      id: clientContact._id,
      clientId: clientContact.clientId,
      contactId: clientContact.contactId,
      createdAt: clientContact.createdAt
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: 'Error linking contact to client', error: errorMessage });
  }
};

// Unlink a contact from a client
export const unlinkContact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract clientId and contactId from request parameters
    const { clientId, contactId } = req.params;
    
    // Validate that both IDs are provided
    const result = await ClientContact.findOneAndDelete({ clientId, contactId });
    if (!result) {
      res.status(404).json({ message: 'Relationship not found' });
      return;
    }
    
    // Successfully unlinked
    res.json({ message: 'Contact unlinked from client successfully' });
  } catch (error) {
    // Handle errors and return appropriate response
    // If error is an instance of Error, use its message; otherwise, convert to string
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: 'Error unlinking contact from client', error: errorMessage });
  }
};
