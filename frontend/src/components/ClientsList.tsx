
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Client } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface ClientsListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
}

const ClientsList = ({ clients, onEdit }: ClientsListProps) => {
  const sortedClients = clients.sort((a, b) => a.name.localeCompare(b.name));
  
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    goToPage,
    changeItemsPerPage,
    showPagination
  } = usePagination({ items: sortedClients, defaultItemsPerPage: 2 });

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
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Client Code</th>
              <th className="text-center py-3 px-4 font-semibold">No. of linked contacts</th>
              <th className="text-center py-3 px-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((client) => (
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
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
      
      {showPagination && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={clients.length}
          onPageChange={goToPage}
          onItemsPerPageChange={changeItemsPerPage}
        />
      )}
    </Card>
  );
};

export default ClientsList;
