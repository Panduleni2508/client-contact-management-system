
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Contact } from '@/types';

interface ContactsListProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
}

const ContactsList = ({ contacts, onEdit }: ContactsListProps) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No contact(s) found.
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Surname</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Email address</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">No. of linked clients</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts
              .sort((a, b) => `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`))
              .map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-left">{contact.name}</td>
                  <td className="py-3 px-4 text-left">{contact.surname}</td>
                  <td className="py-3 px-4 text-left">{contact.email}</td>
                  <td className="py-3 px-4 text-center">{contact.linkedClients}</td>
                  <td className="py-3 px-4 text-center">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contact)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ContactsList;
