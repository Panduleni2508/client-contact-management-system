"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactClients = exports.deleteContact = exports.updateContact = exports.createContact = exports.getContacts = void 0;
const Contact_1 = __importDefault(require("../models/Contact"));
const ClientContact_1 = __importDefault(require("../models/ClientContact"));
// FETCH ALL CONTACTS
// This function retrieves all contacts from the database and counts how many clients are linked to each contact.
const getContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacts = yield Contact_1.default.find();
        const contactsWithCounts = yield Promise.all(contacts.map((contact) => __awaiter(void 0, void 0, void 0, function* () {
            const linkedClients = yield ClientContact_1.default.countDocuments({ contactId: contact._id });
            return {
                id: contact._id,
                name: contact.name,
                surname: contact.surname,
                email: contact.email,
                linkedClients
            };
        })));
        res.json(contactsWithCounts);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Error fetching contacts', error: errorMessage });
    }
});
exports.getContacts = getContacts;
// Create a new contact
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = new Contact_1.default(req.body);
        yield contact.save();
        res.status(201).json({
            id: contact._id,
            name: contact.name,
            surname: contact.surname,
            email: contact.email,
            linkedClients: 0
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Error creating contact', error: errorMessage });
    }
});
exports.createContact = createContact;
// Update an existing contact by ID
const updateContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield Contact_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contact) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }
        const linkedClients = yield ClientContact_1.default.countDocuments({ contactId: contact._id });
        res.json({
            id: contact._id,
            name: contact.name,
            surname: contact.surname,
            email: contact.email,
            linkedClients
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Error updating contact', error: errorMessage });
    }
});
exports.updateContact = updateContact;
// Delete a contact by ID
const deleteContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield Contact_1.default.findByIdAndDelete(req.params.id);
        if (!contact) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }
        // Also delete all client-contact relationships
        yield ClientContact_1.default.deleteMany({ contactId: req.params.id });
        res.json({ message: 'Contact deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Error deleting contact', error: errorMessage });
    }
});
exports.deleteContact = deleteContact;
// Get all clients linked to a specific contact
const getContactClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactClients = yield ClientContact_1.default.find({ contactId: req.params.id }).populate('clientId');
        const clients = contactClients.map(cc => ({
            id: cc.clientId._id,
            name: cc.clientId.name,
            code: cc.clientId.code,
            linkedContacts: 0 // Will be calculated separately if needed
        }));
        res.json(clients);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Error fetching contact clients', error: errorMessage });
    }
});
exports.getContactClients = getContactClients;
