import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomerContactFields } from './CustomerContactFields';
import { CustomerAddressFields } from './CustomerAddressFields';
import { CustomerTaxFields } from './CustomerTaxFields';
import { CustomerNotesField } from './CustomerNotesField';

const CustomerForm: React.FC = () => {
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomerContactFields form={form} />
      <CustomerAddressFields form={form} />
      <CustomerTaxFields form={form} />
      <CustomerNotesField form={form} />

      <Button type="submit" className="w-full" disabled={isLoading}>
        Submit
      </Button>
    </form>
  );
};

export default CustomerForm;
