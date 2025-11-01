// types/event.ts
export interface FormField {
  id: string;
  event_id: string;
  field_name: string;
  field_type: 'text' | 'email' | 'number' | 'select' | 'checkbox';
  is_required: boolean;
  options: {
    values: string[];
  } | null;
  order: number;
}

export type DynamicFormData = Record<string, string | string[]>;