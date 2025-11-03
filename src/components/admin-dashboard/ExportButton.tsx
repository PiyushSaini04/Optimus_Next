// /src/components/dashboard/ExportButton.tsx
import { Download } from 'lucide-react';

// --- INTERFACES ---

// T is the generic type for the data array (e.g., Event, Organization, etc.)
// We constrain it to be an object with string/number index signatures for safety
type DataRow = Record<string, any>; 

interface ExportButtonProps<T extends DataRow> {
    data: T[];
    filename: string;
}

// --- HELPER FUNCTIONS ---

/**
 * Converts a JSON array to a CSV string.
 */
const jsonToCSV = <T extends DataRow>(data: T[]): string => { // <-- Typed generic function
    if (!data || data.length === 0) return '';

    // 1. Get Headers
    // Access keys from the first row, ensuring data[0] exists before access
    const headers = Object.keys(data[0] || {}) as Array<keyof T>;
    const csvHeaders = headers.join(',');

    // 2. Get Rows
    const csvRows = data.map((row: T) => {
        return headers.map(fieldName => {
            let value: any = row[fieldName]; // <-- Use 'any' temporarily or cast later

            // 1. Handle nulls and objects (value becomes a string or remains original type)
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            
            // 2. FIX: Explicitly convert to string here before any string methods are called
            let stringValue = String(value);

            // 3. Escape commas and quotes for CSV format
            stringValue = stringValue.replace(/"/g, '""');
            if (stringValue.includes(',') || stringValue.includes('\n')) {
                stringValue = `"${stringValue}"`;
            }
            
            // FIX: Return the newly created stringValue
            return stringValue;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
};

const downloadCSV = <T extends DataRow>(data: T[], filename: string) => { // <-- Typed generic function
    if (!data || data.length === 0) {
        alert(`No data available to export for ${filename}.`);
        return;
    }
    
    const csvString = jsonToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
};

// --- COMPONENT ---

// Use the interface and a generic type T for the component
export default function ExportButton<T extends DataRow>({ data, filename }: ExportButtonProps<T>) { // <-- Props are fully typed
    return (
        <button 
            onClick={() => downloadCSV(data, filename)} 
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            disabled={!data || data.length === 0}
            title={`Download ${filename} table data`}
        >
            <Download size={20} className="mr-2" />
            Export to CSV
        </button>
    );
}