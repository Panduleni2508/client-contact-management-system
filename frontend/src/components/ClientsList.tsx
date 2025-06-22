
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Client } from '@/types';

interface ClientsListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
}

const ClientsList = ({ clients, onEdit }: ClientsListProps) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No client(s) found.
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
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Client Code</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">No. of linked contacts</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-left">{client.name}</td>
                  <td className="py-3 px-4 text-left font-mono text-sm">{client.code}</td>
                  <td className="py-3 px-4 text-center">{client.linkedContacts}</td>
                  <td className="py-3 px-4 text-center">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(client)}
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

export default ClientsList;
