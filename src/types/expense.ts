export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  transactionDate: string;
  merchant?: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  isRecurring: boolean;
  tags: string[];
  notes?: string;
  category: Category;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
  receiptUrl?: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  transactionDate: string;
  merchant?: string;
  paymentMethod: Expense['paymentMethod'];
  categoryId?: string;
  isRecurring?: boolean;
  tags?: string[];
  notes?: string;
  receiptUrl?: string;
}
