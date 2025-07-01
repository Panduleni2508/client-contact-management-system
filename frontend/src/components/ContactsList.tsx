
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Contact } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface ContactsListProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
}

const ContactsList = ({ contacts, onEdit }: ContactsListProps) => {
  const sortedContacts = contacts.sort((a, b) =>
    `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`)
  );

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    goToPage,
    changeItemsPerPage,
    showPagination
  } = usePagination({ items: sortedContacts, defaultItemsPerPage: 2 });

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
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Surname</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email address</th>
              <th className="text-center py-3 px-4 font-semibold">No. of linked clients</th>
              <th className="text-center py-3 px-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((contact) => (
              <tr key={contact.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-left">{contact.surname}</td>
                <td className="py-3 px-4 text-left">{contact.name}</td>
                <td className="py-3 px-4 text-left">{contact.email}</td>
                <td className="py-3 px-4 text-center">{contact.linkedClients}</td>
                <td className="py-3 px-4 text-center">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contact)}
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
          totalItems={contacts.length}
          onPageChange={goToPage}
          onItemsPerPageChange={changeItemsPerPage}
        />
      )}
    </Card>
  );
};

export default ContactsList;
