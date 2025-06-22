
export interface Client {
  id: string;
  name: string;
  code: string;
  linkedContacts: number;
}

export interface Contact {
  id: string;
  name: string;
  surname: string;
  email: string;
  linkedClients: number;
}

export interface ClientContact {
  id: string;
  clientId: string;
  contactId: string;
  createdAt: Date;
}
