
import { Client, Contact, ClientContact } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

// Client API functions
export const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  },

  create: async (clientData: Omit<Client, 'id' | 'code' | 'linkedContacts'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
  },

  update: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete client');
  },
};

// Contact API functions
export const contactApi = {
  getAll: async (): Promise<Contact[]> => {
    const response = await fetch(`${API_BASE_URL}/contacts`);
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
  },

  create: async (contactData: Omit<Contact, 'id' | 'linkedClients'>): Promise<Contact> => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Failed to create contact');
    return response.json();
  },

  update: async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) throw new Error('Failed to update contact');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete contact');
  },
};

// Client-Contact relationship API functions
export const clientContactApi = {
  linkContact: async (clientId: string, contactId: string): Promise<ClientContact> => {
    const response = await fetch(`${API_BASE_URL}/client-contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, contactId }),
    });
    if (!response.ok) throw new Error('Failed to link contact to client');
    return response.json();
  },

  unlinkContact: async (clientId: string, contactId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/client-contacts/${clientId}/${contactId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to unlink contact from client');
  },

  getClientContacts: async (clientId: string): Promise<Contact[]> => {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/contacts`);
    if (!response.ok) throw new Error('Failed to fetch client contacts');
    return response.json();
  },

  getContactClients: async (contactId: string): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/clients`);
    if (!response.ok) throw new Error('Failed to fetch contact clients');
    return response.json();
  },
};
