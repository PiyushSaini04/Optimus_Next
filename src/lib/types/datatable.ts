// /src/types/datatable.ts
import { UUID, Recruitment } from './supabase'; // Import necessary types

// A generic interface for a single data row's ID property

export type DataRowWithId = { id: UUID | number } | Recruitment;

// Define the shape of a column object
export interface Column<T extends DataRowWithId> {
  header: string;
  // Use keyof T to ensure accessorKey is a property of the data object
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