
import { Router } from 'express';
import { linkContact, unlinkContact } from '../controllers/clientContactController';

// This file defines the routes for linking and unlinking contacts to clients.

const router = Router();
// using the Express Router to handle POST and DELETE requests for linking and unlinking contacts.
router.post('/', linkContact);
router.delete('/:clientId/:contactId', unlinkContact);

export default router;
