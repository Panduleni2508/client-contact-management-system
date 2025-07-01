import { Request, Response } from 'express';
import Client from '../models/Client';
import ClientContact from '../models/ClientContact';



const generateClientCode = async (clientName: string): Promise<string> => {
  // Split the client name into words and filter out empty strings
  const words = clientName.trim().split(/\s+/).filter(word => word.length > 0);
  
  let alphaPart = '';
  
  if (words.length >= 3) {
    // For 3+ words: take first letter of each word
    alphaPart = words.map(word => word[0]).join('').slice(0, 3).toUpperCase();
  } else if (words.length === 2) {
    // For 2 words: first letter of first word + first 2 letters of second word
    alphaPart = (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  } else if (words.length === 1) {
    // For 1 word: first 3 letters
    alphaPart = words[0].slice(0, 3).toUpperCase();
  } else {
    // Handle empty input by using 'AAA'
    alphaPart = 'AAA';
  }
  
  // If alphaPart is shorter than 3 characters, fill with 'A' to 'Z'
  if (alphaPart.length < 3) {
    const fillChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = alphaPart.length; i < 3; i++) {
      alphaPart += fillChars[i - alphaPart.length];
    }
  }
  
  // Find the next available numeric part for this alpha prefix
  let numericPart = 1;
  let isUnique = false;
  
  // Loop until we find a unique code
  while (!isUnique) {
    const testCode = `${alphaPart}${numericPart.toString().padStart(3, '0')}`;
    const existingClient = await Client.findOne({ code: testCode });
    
    // If no existing client with this code, we have a unique code
    if (!existingClient) {
      isUnique = true;
    } else {
      numericPart++;
    }
  }
  
  // Return the final unique code
  return `${alphaPart}${numericPart.toString().padStart(3, '0')}`;
};


// Controller functions for managing clients
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find();
    
    const clientsWithCounts = await Promise.all(
      // Map through each client and count linked contacts
      clients.map(async (client: typeof Client.prototype) => {
        // Count the number of linked contacts for each client
        const linkedContacts = await ClientContact.countDocuments({ clientId: client._id });
        // Return the client details along with the count of linked contacts
        return {
          id: client._id,
          name: client.name,
          code: client.code,
          linkedContacts
        };
      })
    );
    // Return the clients with their linked contact counts
    res.json(clientsWithCounts);
  } catch (error: any) {
    // Handle any errors that occur during the database query
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};


// Create a new client with a unique code
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = await generateClientCode(req.body.name);
    const client = new Client({ ...req.body, code });
    await client.save();
    
    res.status(201).json({
      id: client._id,
      name: client.name,
      code: client.code,
      linkedContacts: 0
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating client', error: error.message });
  }
};

// Update an existing client by ID
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    const linkedContacts = await ClientContact.countDocuments({ clientId: client._id });
    res.json({
      id: client._id,
      name: client.name,
      code: client.code,
      linkedContacts
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating client', error: error.message });
  }
};

// Delete a client by ID
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    // Also delete all client-contact relationships
    await ClientContact.deleteMany({ clientId: req.params.id });
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: 'Error deleting client', error: error.message });
  }
};


// Fetch all contacts linked to a specific client
export const getClientContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientContacts = await ClientContact.find({ clientId: req.params.id }).populate({ path: 'contactId', model: 'Contact' });
    const contacts = clientContacts.map(cc => {
      const contact = cc.contactId as any;
      return {
        id: contact._id,
        name: contact.name,
        surname: contact.surname,
        email: contact.email,
        linkedClients: 0 // Will be calculated separately if needed
      };
    });
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching client contacts', error: error.message });
  }
};
