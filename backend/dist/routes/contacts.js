"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
// This file defines the routes for managing contacts, including creating, updating, deleting, and fetching contacts and their linked clients.
const router = (0, express_1.Router)();
// using the Express Router to handle GET, POST, PUT, and DELETE requests for contacts.
router.get('/', contactController_1.getContacts);
router.post('/', contactController_1.createContact);
router.put('/:id', contactController_1.updateContact);
router.delete('/:id', contactController_1.deleteContact);
router.get('/:id/clients', contactController_1.getContactClients);
exports.default = router;
