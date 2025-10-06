import React, { useState, useRef } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X,
  Tag,
  Bot,
  Upload,
  Repeat,
  File,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories, useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { uploadService, type UploadedReceipt } from '@/services/uploadService';
import type { Expense, CreateExpenseData } from '@/types/expense';

// Create a more flexible schema that matches react-hook-form expectations
const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  transactionDate: z.string().min(1, 'Date is required'),
  merchant: z.string().optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'DIGITAL_WALLET']),
  categoryId: z.string().optional(),
  isRecurring: z.boolean(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

// Create a form-specific type that's more flexible
interface ExpenseFormData extends FieldValues {
  amount: number;
  description: string;
  transactionDate: string;
  merchant?: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  categoryId?: string;
  isRecurring: boolean;
  tags: string[];
  notes?: string;
}

interface ExpenseFormProps {
  expense?: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: 'CREDIT_CARD' as const, label: 'Credit Card' },
  { value: 'DEBIT_CARD' as const, label: 'Debit Card' },
  { value: 'CASH' as const, label: 'Cash' },
  { value: 'BANK_TRANSFER' as const, label: 'Bank Transfer' },
  { value: 'DIGITAL_WALLET' as const, label: 'Digital Wallet' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose, onSuccess }) => {
  const [tagInput, setTagInput] = useState('');
  const [useAiCategorization, setUseAiCategorization] = useState(!expense);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  // Use a more flexible approach with the form
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any, // Type assertion to bypass the resolver issue
    mode: 'onChange',
    defaultValues: {
      amount: expense?.amount || 0,
      description: expense?.description || '',
      transactionDate: expense?.transactionDate ? expense.transactionDate.split('T')[0] : new Date().toISOString().split('T')[0],
      merchant: expense?.merchant || '',
      paymentMethod: expense?.paymentMethod || 'CREDIT_CARD',
      categoryId: expense?.category?.id || '',
      isRecurring: expense?.isRecurring || false,
      tags: expense?.tags || [],
      notes: expense?.notes || '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedTags = watch('tags') || [];

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const validateAndUploadFile = async (file: File): Promise<void> => {
    setUploadError(null);
    setIsUploading(true);
    
    try {
      const result = await uploadService.uploadReceipt(file);
      
      if (result.success && result.data) {
        setUploadedReceipt(result.data);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeReceipt = async () => {
    if (uploadedReceipt) {
      try {
        const result = await uploadService.deleteReceipt(uploadedReceipt.publicId);

        if (result.success) {
          setUploadedReceipt(null);
          setUploadError(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (error) {
        console.error('Error deleting receipt:', error);
        setUploadedReceipt(null);
      }
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    
    try {
      const expenseData: CreateExpenseData = {
        amount: Number(data.amount),
        description: data.description,
        transactionDate: data.transactionDate,
        merchant: data.merchant || undefined,
        paymentMethod: data.paymentMethod,
        categoryId: (useAiCategorization || !data.categoryId) ? undefined : data.categoryId,
        isRecurring: data.isRecurring,
        tags: data.tags || [],
        notes: data.notes || undefined,
        receiptUrl: uploadedReceipt?.url,
      };

      if (expense) {
        await updateExpense.mutateAsync({
          id: expense.id,
          data: expenseData,
        });
      } else {
        await createExpense.mutateAsync(expenseData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save expense:', error);
      setUploadError('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const currentTags = watchedTags || [];
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watchedTags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Amount and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                label="Amount"
                error={errors.amount?.message as string}
                placeholder="0.00"
              />
            </div>
            <div>
              <Input
                {...register('description')}
                label="Description"
                error={errors.description?.message as string}
                placeholder="Coffee and pastry"
              />
            </div>
          </div>

          {/* Date and Merchant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...register('transactionDate')}
                type="date"
                label="Transaction Date"
                error={errors.transactionDate?.message as string}
              />
            </div>
            <div>
              <Input
                {...register('merchant')}
                label="Merchant (Optional)"
                error={errors.merchant?.message as string}
                placeholder="Starbucks"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="form-label">Payment Method</label>
            <select
              {...register('paymentMethod')}
              className="form-input"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message as string}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">Category</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={useAiCategorization}
                  onChange={(e) => setUseAiCategorization(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  Use AI categorization
                </label>
              </div>
            </div>
            
            {!useAiCategorization && (
              <select
                {...register('categoryId')}
                className="form-input"
              >
                <option value="">Select a category</option>
                {categoriesData?.data?.categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            
            {useAiCategorization && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <Bot className="h-5 w-5 mr-2" />
                  <span className="text-sm">
                    AI will automatically categorize this expense based on the description and merchant.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">Tags (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(watchedTags || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Add a tag..."
                className="form-input rounded-r-none"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="secondary"
                className="rounded-l-none border-l-0"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recurring Expense */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isRecurring')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700 flex items-center">
              <Repeat className="h-4 w-4 mr-1" />
              This is a recurring expense
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="form-input"
              placeholder="Additional notes about this expense..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message as string}</p>
            )}
          </div>

          {/* Receipt Upload using Upload Service */}
          <div>
            <label className="form-label">Receipt (Optional)</label>
            
            {!uploadedReceipt ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isUploading 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-blue-600">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag and drop a receipt image, or{' '}
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP, PDF up to 10MB • Automatically optimized
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {/* Thumbnail for images */}
                    {uploadService.isImageFile(uploadedReceipt.format) && uploadedReceipt.thumbnailUrl ? (
                      <img
                        src={uploadedReceipt.thumbnailUrl}
                        alt="Receipt thumbnail"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                        <File className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedReceipt.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadService.formatFileSize(uploadedReceipt.size)} • {uploadedReceipt.format?.toUpperCase()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Uploaded to Cloudinary
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Preview button for images */}
                    {uploadService.isImageFile(uploadedReceipt.format) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Download/View button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadedReceipt.url, '_blank')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeReceipt}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant='gradient'
              type="submit"
              loading={isSubmitting}
              disabled={isUploading}
              className="flex-1"
            >
              {expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>

        {/* Image Preview Modal */}
        {showPreview && uploadedReceipt && uploadService.isImageFile(uploadedReceipt.format) && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={uploadedReceipt.previewUrl || uploadedReceipt.url}
                alt="Receipt preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};