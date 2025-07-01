import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { useToast } from '@/components/ui/use-toast';
import { X, Unlink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Contact, Client } from '@/types';
import { clientContactApi } from '@/services/api';

interface ContactFormProps {
  contact?: Contact | null;
  clients: Client[];
  existingContacts: Contact[];
  onSubmit: (contact: Omit<Contact, 'id' | 'linkedClients'>) => Promise<Contact> | void;
  onClose: () => void;
  onRefresh?: () => void;
}

const ContactForm = ({ contact, clients, existingContacts, onSubmit, onClose, onRefresh }: ContactFormProps) => {
  const [name, setName] = useState(contact?.name || '');
  const [surname, setSurname] = useState(contact?.surname || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [linkedClients, setLinkedClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [createdContactId, setCreatedContactId] = useState<string | null>(contact?.id || null);
  const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
  const [showUnlinkConfirmation, setShowUnlinkConfirmation] = useState(false);
  const [clientToUnlink, setClientToUnlink] = useState<Client | null>(null);
  const [contactCreated, setContactCreated] = useState(!!contact);
  const { toast } = useToast();

  // Fetch linked clients when contact changes or component mounts
  useEffect(() => {
    const fetchLinkedClients = async () => {
      const contactId = createdContactId || contact?.id;
      if (contactId) {
        try {
          const linked = await clientContactApi.getContactClients(contactId);
          setLinkedClients(linked);
        } catch (error) {
          console.error('Error fetching linked clients:', error);
        }
      }
    };

    fetchLinkedClients();
  }, [createdContactId, contact?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && surname.trim() && email.trim()) {
      try {
        setCreating(true);
        if (contact) {
          await onSubmit({
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
          });
          onClose();
        } else {
          const createdContact = await onSubmit({
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
          });
          
          if (createdContact && createdContact.id) {
            setCreatedContactId(createdContact.id);
            setContactCreated(true);
            toast({
              title: 'Success',
              description: 'Contact created successfully. You can now link it to clients.',
            });
          }
        }
      } catch (error) {
        console.error('Error creating contact:', error);
        toast({
          title: 'Error',
          description: 'Failed to create contact. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setCreating(false);
      }
    }
  };

  const handleLinkClients = async () => {
    const contactId = createdContactId || contact?.id;
    if (!contactId || selectedClients.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select clients to link.',
        variant: 'destructive',
      });
      return;
    }

    // Show confirmation dialog
    setShowLinkConfirmation(true);
  };

  const confirmLinkClients = async () => {
    const contactId = createdContactId || contact?.id;
    if (!contactId || selectedClients.length === 0) return;

    try {
      setLinking(true);
      for (const clientId of selectedClients) {
        await clientContactApi.linkContact(clientId, contactId);
      }
      toast({
        title: 'Success',
        description: 'Contact linked to clients successfully.',
      });
      // Refresh linked clients list
      const linked = await clientContactApi.getContactClients(contactId);
      setLinkedClients(linked);
      setSelectedClients([]);
      onRefresh?.();
    } catch (error) {
      console.error('Error linking contact to clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to link contact to clients. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLinking(false);
      setShowLinkConfirmation(false);
    }
  };

  const handleMultiClientSelection = (clientIds: string[]) => {
    setSelectedClients(clientIds);
  };

  const handleUnlinkClient = async (client: Client) => {
    setClientToUnlink(client);
    setShowUnlinkConfirmation(true);
  };

  const confirmUnlinkClient = async () => {
    if (!clientToUnlink) return;
    
    const contactId = createdContactId || contact?.id;
    if (!contactId) return;

    try {
      setUnlinking(true);
      await clientContactApi.unlinkContact(clientToUnlink.id, contactId);
      toast({
        title: 'Success',
        description: 'Client unlinked successfully.',
      });
      // Refresh linked clients list
      const linked = await clientContactApi.getContactClients(contactId);
      setLinkedClients(linked);
      onRefresh?.();
    } catch (error) {
      console.error('Error unlinking client:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlink client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUnlinking(false);
      setShowUnlinkConfirmation(false);
      setClientToUnlink(null);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isEmailUnique = (email: string) => {
    if (!email || contactCreated) return true; // Skip validation after contact is created
    const existingContactWithEmail = existingContacts.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.id !== contact?.id
    );
    return !existingContactWithEmail;
  };

  const getEmailError = () => {
    if (!email || contactCreated) return null; // Skip validation after contact is created
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    if (!isEmailUnique(email)) return 'This email address is already in use';
    return null;
  };

  // Prepare client options for the searchable select
  const availableClientOptions: SearchableSelectOption[] = clients
    .filter(client => !linkedClients.some(linked => linked.id === client.id))
    .map(client => ({
      value: client.id,
      label: `${client.name} (${client.code})`,
      searchableText: `${client.name} ${client.code}`
    }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="clients" disabled={!contact && !createdContactId}>Client(s)</TabsTrigger>
            <TabsTrigger value="linked-clients" disabled={!contact && !createdContactId}>Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter first name"
                  required
                  className="mt-1"
                  disabled={contactCreated && !contact}
                />
              </div>

              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Enter surname"
                  required
                  className="mt-1"
                  disabled={contactCreated && !contact}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="mt-1"
                  disabled={contactCreated && !contact}
                />
                {getEmailError() && (
                  <p className="text-sm text-red-600 mt-1">{getEmailError()}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!name.trim() || !surname.trim() || !email.trim() || !isValidEmail(email) || !isEmailUnique(email) || creating || (contactCreated && !contact)}
                >
                  {creating ? 'Creating...' : contact ? 'Update' : contactCreated ? 'Contact Created' : 'Create'} Contact
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  {contactCreated && !contact ? 'Done' : 'Cancel'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Link this contact to one or more clients. Note that one contact can be linked to multiple clients.
              </p>
              
              <div>
                <Label htmlFor="client-select">Select Client(s)</Label>
                <SearchableSelect
                  options={availableClientOptions}
                  selectedValues={selectedClients}
                  onMultiValueChange={handleMultiClientSelection}
                  placeholder="Choose clients to link..."
                  searchPlaceholder="Search clients..."
                  emptyText="No clients found."
                  multiSelect={true}
                  className="mt-1"
                />
              </div>

              {availableClientOptions.length === 0 && (
                <p className="text-center py-8 text-gray-500">
                  {clients.length === 0 ? 'No clients found.' : 'All clients are already linked to this contact.'}
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleLinkClients}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={selectedClients.length === 0 || linking}
                >
                  {linking ? 'Linking...' : 'Link to Selected Clients'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="linked-clients" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                View and manage clients linked to this contact.
              </p>
              
              {linkedClients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Client Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Client Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedClients
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((client) => (
                          <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-left">{client.name}</td>
                            <td className="py-3 px-4 text-left font-mono text-sm">{client.code}</td>
                            <td className="py-3 px-4 text-left">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkClient(client)}
                                disabled={unlinking}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Unlink className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No clients found.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Link Confirmation Dialog */}
      <AlertDialog open={showLinkConfirmation} onOpenChange={setShowLinkConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link Clients</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to link {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} to this contact?
              {selectedClients.length > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Selected clients:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {selectedClients.map((clientId) => {
                      const client = clients.find(c => c.id === clientId);
                      return client ? (
                        <li key={clientId}>
                          {client.name} ({client.code})
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={linking}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLinkClients}
              disabled={linking}
               className=" bg-blue-600 hover:bg-blue-700"
            >
              {linking ? 'Linking...' : 'Link Clients'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkConfirmation} onOpenChange={setShowUnlinkConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink {clientToUnlink ? `${clientToUnlink.name} (${clientToUnlink.code})` : 'this client'} from this contact?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinking}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnlinkClient}
              disabled={unlinking}
              className="bg-red-600 hover:bg-red-700"
            >
              {unlinking ? 'Unlinking...' : 'Unlink Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactForm;
