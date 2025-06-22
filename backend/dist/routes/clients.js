"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("../controllers/clientController");
// This file defines the routes for managing clients, including creating, updating, deleting, and fetching clients and their contacts.
const router = (0, express_1.Router)();
// using the Express Router to handle GET, POST, PUT, and DELETE requests for clients.
router.get('/', clientController_1.getClients);
router.post('/', clientController_1.createClient);
router.put('/:id', clientController_1.updateClient);
router.delete('/:id', clientController_1.deleteClient);
router.get('/:id/contacts', clientController_1.getClientContacts);
exports.default = router;
