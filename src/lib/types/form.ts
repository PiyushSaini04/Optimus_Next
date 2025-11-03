// /src/types/form.ts
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'datetime-local' | 'checkbox';
  required: boolean;
  options?: string[]; // Only for 'select' type
}

// Props for the generic CRUD Form
export interface CRUDFormProps<T extends { id: string | number }> {
    table: string;
    // T is the generic data type (Event, Recruitment, etc.)
    initialData: T | null; 
    onSuccess: (action: 'inserted' | 'updated') => void;
    onCancel: () => void;
    // The fields definition must be passed in
    fields: FormField[];
}