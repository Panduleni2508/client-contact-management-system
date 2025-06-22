
import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient, getClientContacts } from '../controllers/clientController';

// This file defines the routes for managing clients, including creating, updating, deleting, and fetching clients and their contacts.
const router = Router();

// using the Express Router to handle GET, POST, PUT, and DELETE requests for clients.
router.get('/', getClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.get('/:id/contacts', getClientContacts);

export default router;
