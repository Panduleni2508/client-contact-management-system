"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientContactController_1 = require("../controllers/clientContactController");
// This file defines the routes for linking and unlinking contacts to clients.
const router = (0, express_1.Router)();
// using the Express Router to handle POST and DELETE requests for linking and unlinking contacts.
router.post('/', clientContactController_1.linkContact);
router.delete('/:clientId/:contactId', clientContactController_1.unlinkContact);
exports.default = router;
