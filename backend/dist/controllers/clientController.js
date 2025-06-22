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
exports.getClientContacts = exports.deleteClient = exports.updateClient = exports.createClient = exports.getClients = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const ClientContact_1 = __importDefault(require("../models/ClientContact"));
const generateClientCode = (clientName) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract first 3 characters from client name, convert to uppercase
    let alphaPart = clientName.substring(0, 3).toUpperCase();
    // If name is shorter than 3 characters, fill with 'A' to 'Z'
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
        const existingClient = yield Client_1.default.findOne({ code: testCode });
        // If no existing client with this code, we have a unique code
        if (!existingClient) {
            isUnique = true;
        }
        // If the code exists, increment the numeric part
        else {
            numericPart++;
        }
    }
    // Return the final unique code
    // Ensure numeric part is always 3 digits
    return `${alphaPart}${numericPart.toString().padStart(3, '0')}`;
});
// Controller functions for managing clients
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield Client_1.default.find();
        const clientsWithCounts = yield Promise.all(
        // Map through each client and count linked contacts
        clients.map((client) => __awaiter(void 0, void 0, void 0, function* () {
            // Count the number of linked contacts for each client
            const linkedContacts = yield ClientContact_1.default.countDocuments({ clientId: client._id });
            // Return the client details along with the count of linked contacts
            return {
                id: client._id,
                name: client.name,
                code: client.code,
                linkedContacts
            };
        })));
        // Return the clients with their linked contact counts
        res.json(clientsWithCounts);
    }
    catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
});
exports.getClients = getClients;
// Create a new client with a unique code
const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = yield generateClientCode(req.body.name);
        const client = new Client_1.default(Object.assign(Object.assign({}, req.body), { code }));
        yield client.save();
        res.status(201).json({
            id: client._id,
            name: client.name,
            code: client.code,
            linkedContacts: 0
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating client', error: error.message });
    }
});
exports.createClient = createClient;
// Update an existing client by ID
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        const linkedContacts = yield ClientContact_1.default.countDocuments({ clientId: client._id });
        res.json({
            id: client._id,
            name: client.name,
            code: client.code,
            linkedContacts
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating client', error: error.message });
    }
});
exports.updateClient = updateClient;
// Delete a client by ID
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findByIdAndDelete(req.params.id);
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        // Also delete all client-contact relationships
        yield ClientContact_1.default.deleteMany({ clientId: req.params.id });
        res.json({ message: 'Client deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting client', error: error.message });
    }
});
exports.deleteClient = deleteClient;
// Fetch all contacts linked to a specific client
const getClientContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientContacts = yield ClientContact_1.default.find({ clientId: req.params.id }).populate({ path: 'contactId', model: 'Contact' });
        const contacts = clientContacts.map(cc => {
            const contact = cc.contactId;
            return {
                id: contact._id,
                name: contact.name,
                surname: contact.surname,
                email: contact.email,
                linkedClients: 0 // Will be calculated separately if needed
            };
        });
        res.json(contacts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching client contacts', error: error.message });
    }
});
exports.getClientContacts = getClientContacts;
