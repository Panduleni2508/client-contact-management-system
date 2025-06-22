"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const clients_1 = __importDefault(require("./routes/clients"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const clientContacts_1 = __importDefault(require("./routes/clientContacts"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'https://your-frontend-domain.com'],
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/clients', clients_1.default);
app.use('/api/contacts', contacts_1.default);
app.use('/api/client-contacts', clientContacts_1.default);
// health check endpoint to verify that the server is running and responding correctly.
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clientcontacts')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
