import React from 'react';
import { CustomerModal } from './CustomerModal';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerId: string) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  return (
    <CustomerModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
