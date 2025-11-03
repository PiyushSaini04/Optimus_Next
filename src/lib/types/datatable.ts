// /src/types/datatable.ts
import { UUID } from './supabase'; // Assuming UUID is defined here

// --- FIX APPLIED HERE ---
// 1. Removed the union with 'Recruitment'.
// 2. Used 'uuid' as the required ID field (matching ProfileWithOrg).
// 3. Added an index signature for maximum flexibility.
export type DataRowWithId = { [key: string]: any } & (
  | { id: UUID | number; uuid?: never }
  | { uuid: UUID | number; id?: never }
);

// Define the shape of a column object
export interface Column<T extends DataRowWithId> {
  header: string;
  // We use 'string' here because the index signature makes keyof T very broad
  accessorKey: keyof T | string; 
  // The render function takes the cell value and the whole row (T)
  render?: (value: any, row: T) => React.ReactNode; 
}

// Define the component's overall props
export interface DataTableProps<T extends DataRowWithId> {
  data: T[];
  columns: Column<T>[];
  tableName: string;
  onDelete: (id: UUID | number) => void;
  onEdit: (row: T) => void;
  // This prop is conditional based on the table, so it must be optional ('?')
  onViewRegistrations?: (row: T) => void; 
}