
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientsView from '@/components/ClientsView';
import ContactsView from '@/components/ContactsView';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Development Practical Test
          </h1>
          <p className="text-gray-600">Client and Contact Management System</p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="clients" className="text-lg">Clients</TabsTrigger>
              <TabsTrigger value="contacts" className="text-lg">Contacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clients">
              <ClientsView />
            </TabsContent>
            
            <TabsContent value="contacts">
              <ContactsView />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
