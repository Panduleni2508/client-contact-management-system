
import { Router } from 'express';
import { getContacts, createContact, updateContact, deleteContact, getContactClients } from '../controllers/contactController';

// This file defines the routes for managing contacts, including creating, updating, deleting, and fetching contacts and their linked clients.
const router = Router();

// using the Express Router to handle GET, POST, PUT, and DELETE requests for contacts.
router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.get('/:id/clients', getContactClients);

export default router;
