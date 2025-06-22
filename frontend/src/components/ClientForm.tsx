
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

/**
 * Props for the ClientForm component
 */
interface ClientFormProps {
  client?: Client | null; // The client being edited, or null for new
  contacts: Contact[]; // All available contacts
  onSubmit: (client: Omit<Client, 'id' | 'code' | 'linkedContacts'>) => Promise<Client> | void; // Handler for form submission
  onClose: () => void; // Handler to close the form
  onRefresh?: () => void; // Optional callback to refresh parent data
}

/**
 * Form for creating or editing a client, and linking/unlinking contacts.
 */
const ClientForm = ({ client, contacts, onSubmit, onClose, onRefresh }: ClientFormProps) => {
  // State for client name input
  const [name, setName] = useState(client?.name || '');
  // State for selected contacts to link
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  // State for contacts already linked to this client
  const [linkedContacts, setLinkedContacts] = useState<Contact[]>([]);
  // State for loading indicators
  const [creating, setCreating] = useState(false);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  // State for the created client ID and code (after save)
  const [createdClientId, setCreatedClientId] = useState<string | null>(client?.id || null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(client?.code || null);
  // State for confirmation dialogs
  const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
  const [showUnlinkConfirmation, setShowUnlinkConfirmation] = useState(false);
  const [contactToUnlink, setContactToUnlink] = useState<Contact | null>(null);
  // Toast for notifications
  const { toast } = useToast();

  // Fetch linked contacts when client changes or after creation
  useEffect(() => {
    const fetchLinkedContacts = async () => {
      const clientId = createdClientId || client?.id;
      if (clientId) {
        try {
          const linked = await clientContactApi.getClientContacts(clientId);
          setLinkedContacts(linked);
        } catch (error) {
          console.error('Error fetching linked contacts:', error);
        }
      }
    };
    fetchLinkedContacts();
  }, [createdClientId, client?.id]);

  /**
   * Handles form submission for creating or updating a client.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        setCreating(true);
        // If editing, just update the client
        if (client) {
          await onSubmit({ name: name.trim() });
          onClose();
        } else {
          // Create the client first
          const createdClient = await onSubmit({ name: name.trim() });
          // Store the created client ID and code for linking later
          if (createdClient && createdClient.id) {
            setCreatedClientId(createdClient.id);
            setGeneratedCode(createdClient.code);
            toast({
              title: 'Success',
              description: 'Client created successfully. You can now link it to contacts.',
            });
          }
        }
      } catch (error) {
        console.error('Error creating client:', error);
        toast({
          title: 'Error',
          description: 'Failed to create client. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setCreating(false);
      }
    }
  };

  /**
   * Shows confirmation dialog before linking selected contacts.
   */
  const handleLinkContacts = async () => {
    const clientId = createdClientId || client?.id;
    if (!clientId || selectedContacts.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select contacts to link.',
        variant: 'destructive',
      });
      return;
    }
    setShowLinkConfirmation(true);
  };

  /**
   * Confirms and performs the linking of selected contacts to the client.
   */
  const confirmLinkContacts = async () => {
    const clientId = createdClientId || client?.id;
    if (!clientId || selectedContacts.length === 0) return;
    try {
      setLinking(true);
      for (const contactId of selectedContacts) {
        await clientContactApi.linkContact(clientId, contactId);
      }
      toast({
        title: 'Success',
        description: 'Client linked to contacts successfully.',
      });
      // Refresh linked contacts list
      const linked = await clientContactApi.getClientContacts(clientId);
      setLinkedContacts(linked);
      setSelectedContacts([]);
      onRefresh?.();
    } catch (error) {
      console.error('Error linking client to contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to link client to contacts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLinking(false);
      setShowLinkConfirmation(false);
    }
  };

  /**
   * Shows confirmation dialog before unlinking a contact.
   */
  const handleUnlinkContact = async (contact: Contact) => {
    setContactToUnlink(contact);
    setShowUnlinkConfirmation(true);
  };

  /**
   * Confirms and performs the unlinking of a contact from the client.
   */
  const confirmUnlinkContact = async () => {
    if (!contactToUnlink) return;
    const clientId = createdClientId || client?.id;
    if (!clientId) return;
    try {
      setUnlinking(true);
      await clientContactApi.unlinkContact(clientId, contactToUnlink.id);
      toast({
        title: 'Success',
        description: 'Contact unlinked successfully.',
      });
      // Refresh linked contacts list
      const linked = await clientContactApi.getClientContacts(clientId);
      setLinkedContacts(linked);
      onRefresh?.();
    } catch (error) {
      console.error('Error unlinking contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlink contact. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUnlinking(false);
      setShowUnlinkConfirmation(false);
      setContactToUnlink(null);
    }
  };

  /**
   * Handles selection of a contact to be linked.
   */
  const handleContactSelection = (contactId: string) => {
    if (!selectedContacts.includes(contactId)) {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  /**
   * Removes a contact from the selection list (before linking).
   */
  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter(id => id !== contactId));
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {client ? 'Edit Client' : 'Add New Client'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs for General info, linking contacts, and viewing linked contacts */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contacts" disabled={!client && !createdClientId}>Contact(s)</TabsTrigger>
            <TabsTrigger value="linked-contacts" disabled={!client && !createdClientId}>Contacts</TabsTrigger>
          </TabsList>

          {/* General tab: client name and code */}
          <TabsContent value="general" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter client name"
                  required
                  className="mt-1"
                />
              </div>

              {/* Show generated client code after save */}
              {generatedCode && (
                <div>
                  <Label>Client Code</Label>
                  <div className="mt-1 p-2 bg-gray-50 border rounded text-sm font-mono">
                    {generatedCode}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!name.trim() || creating}
                >
                  {creating ? 'Creating...' : client ? 'Update' : 'Create'} Client
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Contact(s) tab: link contacts to client */}
          <TabsContent value="contacts" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Link this client to one or more contacts. Note that one client can be linked to multiple contacts.
              </p>
              
              <div>
                <Label htmlFor="contact-select">Select Contact(s)</Label>
                <Select onValueChange={handleContactSelection}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose contacts to link..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts
                      // Exclude already selected or already linked contacts
                      .filter(contact => !selectedContacts.includes(contact.id))
                      .filter(contact => !linkedContacts.some(linked => linked.id === contact.id))
                      .map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} {contact.surname} ({contact.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show selected contacts before linking */}
              {selectedContacts.length > 0 && (
                <div className="mt-4">
                  <Label>Selected Contacts:</Label>
                  <div className="mt-2 space-y-2">
                    {selectedContacts.map((contactId) => {
                      const contact = contacts.find(c => c.id === contactId);
                      return contact ? (
                        <div key={contactId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{contact.name} {contact.surname} ({contact.email})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveContact(contactId)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Show message if no contacts are available to link */}
              {contacts.filter(contact => !selectedContacts.includes(contact.id) && !linkedContacts.some(linked => linked.id === contact.id)).length === 0 && (
                <p className="text-center py-8 text-gray-500">
                  {contacts.length === 0 ? 'No contacts found.' : 'All contacts are already linked to this client.'}
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleLinkContacts}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={selectedContacts.length === 0 || linking}
                >
                  {linking ? 'Linking...' : 'Link to Selected Contacts'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Linked Contacts tab: show and unlink already linked contacts */}
          <TabsContent value="linked-contacts" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                View and manage contacts linked to this client.
              </p>
              
              {linkedContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact Full Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Email Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedContacts
                        .sort((a, b) => `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`))
                        .map((contact) => (
                          <tr key={contact.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-left">
                              ({contact.surname}) {contact.name}
                            </td>
                            <td className="py-3 px-4 text-left">{contact.email}</td>
                            <td className="py-3 px-4 text-left">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkContact(contact)}
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
                  No contacts found.
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
            <AlertDialogTitle>Link Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to link {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} to this client?
              {selectedContacts.length > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Selected contacts:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {selectedContacts.map((contactId) => {
                      const contact = contacts.find(c => c.id === contactId);
                      return contact ? (
                        <li key={contactId}>
                          {contact.name} {contact.surname} ({contact.email})
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
              onClick={confirmLinkContacts}
              disabled={linking}
              className="bg-green-600 hover:bg-green-700"
            >
              {linking ? 'Linking...' : 'Link Contacts'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkConfirmation} onOpenChange={setShowUnlinkConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink {contactToUnlink ? `${contactToUnlink.name} ${contactToUnlink.surname}` : 'this contact'} from this client?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinking}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnlinkContact}
              disabled={unlinking}
              className="bg-red-600 hover:bg-red-700"
            >
              {unlinking ? 'Unlinking...' : 'Unlink Contact'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientForm;
