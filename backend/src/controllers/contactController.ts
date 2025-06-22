import { Request, Response } from 'express';
import Contact from '../models/Contact';
import ClientContact from '../models/ClientContact';


// FETCH ALL CONTACTS
// This function retrieves all contacts from the database and counts how many clients are linked to each contact.
export const getContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find();
    const contactsWithCounts = await Promise.all(
      contacts.map(async (contact) => {
        const linkedClients = await ClientContact.countDocuments({ contactId: contact._id });
        return {
          id: contact._id,
          name: contact.name,
          surname: contact.surname,
          email: contact.email,
          linkedClients
        };
      })
    );
    res.json(contactsWithCounts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Error fetching contacts', error: errorMessage });
  }
};

// Create a new contact
export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    
    res.status(201).json({
      id: contact._id,
      name: contact.name,
      surname: contact.surname,
      email: contact.email,
      linkedClients: 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: 'Error creating contact', error: errorMessage });
  }
};

// Update an existing contact by ID
export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    
    const linkedClients = await ClientContact.countDocuments({ contactId: contact._id });
    res.json({
      id: contact._id,
      name: contact.name,
      surname: contact.surname,
      email: contact.email,
      linkedClients
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: 'Error updating contact', error: errorMessage });
  }
};

// Delete a contact by ID
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    
    // Also delete all client-contact relationships
    await ClientContact.deleteMany({ contactId: req.params.id });
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ message: 'Error deleting contact', error: errorMessage });
  }
};

// Get all clients linked to a specific contact
export const getContactClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const contactClients = await ClientContact.find({ contactId: req.params.id }).populate<{ clientId: any }>('clientId');
    const clients = contactClients.map(cc => ({
      id: cc.clientId._id,
      name: cc.clientId.name,
      code: cc.clientId.code,
      linkedContacts: 0 // Will be calculated separately if needed
    }));
    res.json(clients);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Error fetching contact clients', error: errorMessage });
  }
};
