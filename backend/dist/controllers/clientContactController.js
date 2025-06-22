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
exports.unlinkContact = exports.linkContact = void 0;
const ClientContact_1 = __importDefault(require("../models/ClientContact"));
const linkContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate that both clientId and contactId are provided
        const { clientId, contactId } = req.body;
        // Check if relationship already exists
        const existing = yield ClientContact_1.default.findOne({ clientId, contactId });
        if (existing) {
            res.status(400).json({ message: 'Contact is already linked to this client' });
            return;
        }
        // Create new ClientContact relationship
        const clientContact = new ClientContact_1.default({ clientId, contactId });
        yield clientContact.save();
        // Return the created relationship details
        res.status(201).json({
            id: clientContact._id,
            clientId: clientContact.clientId,
            contactId: clientContact.contactId,
            createdAt: clientContact.createdAt
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Error linking contact to client', error: errorMessage });
    }
});
exports.linkContact = linkContact;
// Unlink a contact from a client
const unlinkContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract clientId and contactId from request parameters
        const { clientId, contactId } = req.params;
        // Validate that both IDs are provided
        const result = yield ClientContact_1.default.findOneAndDelete({ clientId, contactId });
        if (!result) {
            res.status(404).json({ message: 'Relationship not found' });
            return;
        }
        // Successfully unlinked
        res.json({ message: 'Contact unlinked from client successfully' });
    }
    catch (error) {
        // Handle errors and return appropriate response
        // If error is an instance of Error, use its message; otherwise, convert to string
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ message: 'Error unlinking contact from client', error: errorMessage });
    }
});
exports.unlinkContact = unlinkContact;
