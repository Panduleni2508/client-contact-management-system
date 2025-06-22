
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ContactForm from './ContactForm';
import ContactsList from './ContactsList';
import { Contact, Client } from '@/types';
import { contactApi, clientApi } from '@/services/api';

const ContactsView = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsData, clientsData] = await Promise.all([
        contactApi.getAll(),
        clientApi.getAll()
      ]);
      setContacts(contactsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'linkedClients'>): Promise<Contact> => {
    try {
      const newContact = await contactApi.create(contactData);
      setContacts([...contacts, newContact]);
      toast({
        title: 'Success',
        description: 'Contact created successfully.',
      });
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contact. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      const updatedContact = await contactApi.update(id, contactData);
      setContacts(contacts.map(contact => 
        contact.id === id ? updatedContact : contact
      ));
      toast({
        title: 'Success',
        description: 'Contact updated successfully.',
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Contacts</h2>
          <p className="text-gray-600 mt-1">Manage your contact database</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Contact
        </Button>
      </div>

      <ContactsList contacts={contacts} onEdit={(contact) => {
        setEditingContact(contact);
        setShowForm(true);
      }} />

      {showForm && (
        <ContactForm
          contact={editingContact}
          clients={clients}
          existingContacts={contacts}
          onSubmit={editingContact ? 
            (data) => handleUpdateContact(editingContact.id, data) : 
            handleAddContact
          }
          onClose={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default ContactsView;
