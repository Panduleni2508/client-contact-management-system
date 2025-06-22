
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ClientForm from './ClientForm';
import ClientsList from './ClientsList';
import { Client, Contact } from '@/types';
import { clientApi, contactApi } from '@/services/api';

const ClientsView = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, contactsData] = await Promise.all([
        clientApi.getAll(),
        contactApi.getAll()
      ]);
      setClients(clientsData);
      setContacts(contactsData);
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

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'code' | 'linkedContacts'>): Promise<Client> => {
    try {
      const newClient = await clientApi.create(clientData);
      setClients([...clients, newClient]);
      toast({
        title: 'Success',
        description: 'Client created successfully.',
      });
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
    try {
      const updatedClient = await clientApi.update(id, clientData);
      setClients(clients.map(client => 
        client.id === id ? updatedClient : client
      ));
      toast({
        title: 'Success',
        description: 'Client updated successfully.',
      });
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
          <p className="text-gray-600 mt-1">Manage your client database</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>

      <ClientsList clients={clients} onEdit={(client) => {
        setEditingClient(client);
        setShowForm(true);
      }} />

      {showForm && (
        <ClientForm
          client={editingClient}
          contacts={contacts}
          onSubmit={editingClient ? 
            (data) => handleUpdateClient(editingClient.id, data) : 
            handleAddClient
          }
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default ClientsView;
