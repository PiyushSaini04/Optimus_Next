// /src/components/dashboard/DataTable.tsx (Type-Safe Version)
import { Edit, Trash2, Eye } from 'lucide-react';
// Import the types defined above
import { DataTableProps, Column, DataRowWithId } from '@/lib/types/datatable';

// Use a generic type <T> that extends DataRowWithId to enforce the presence of an ID
export default function DataTable<T extends DataRowWithId>({ 
    data, 
    columns, 
    tableName, 
    onViewRegistrations, 
    onDelete, 
    onEdit 
}: DataTableProps<T>) { // <-- Props are now explicitly typed

  if (!data || data.length === 0) {
    return <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-lg text-center text-gray-300">No {tableName} found.</div>;
  }
  
  // Helper to safely get the ID, supporting 'id' (UUID) and 'id' (number)
  const getRowId = (row: T): string | number => {
    return ('id' in row ? row.id : undefined) as string | number;
  };
  
  return (
    <div className="overflow-x-auto bg-gray-800/90 border border-gray-700 rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((col: Column<T>) => ( // <-- Map parameter is typed
              <th key={col.accessorKey as string} className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700">
                {col.header}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-green-400 uppercase tracking-wider border-b border-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800/90 divide-y divide-gray-700">
          {data.map((row: T) => ( // <-- Map parameter is typed
            <tr key={getRowId(row)} className="hover:bg-gray-700/50">
              {columns.map((col: Column<T>) => (
                <td key={col.accessorKey as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {/* Access the data safely using 'as any' for dynamic key access, passing the whole row to render */}
                  {col.render ? col.render((row as any)[col.accessorKey], row) : (row as any)[col.accessorKey]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                
                {/* 1. Only show Eye button if the prop is provided (e.g., for 'events' table) */}
                {/* We also check if tableName is 'events' for explicit logic */}
                {onViewRegistrations && tableName === 'events' && (
                  <button onClick={() => onViewRegistrations(row)} className="text-green-400 hover:text-green-500" title="View Registrations">
                    <Eye size={18} />
                  </button>
                )}
                
                {/* 2. Edit Button */}
                <button onClick={() => onEdit(row)} className="text-green-400 hover:text-green-500" title="Edit">
                  <Edit size={18} />
                </button>
                
                {/* 3. Delete Button */}
                <button onClick={() => onDelete(getRowId(row))} className="text-red-400 hover:text-red-500" title="Delete">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}