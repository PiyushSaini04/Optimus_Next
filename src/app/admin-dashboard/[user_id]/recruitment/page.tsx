// /src/app/dashboard/recruitment/page.tsx
'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import RecruitmentForm from '@/components/admin-dashboard/RecruitmentForm'; // <-- NEW FORM
import Modal from '@/components/ui/Modal'; 
import { Recruitment } from '@/lib/types/supabase'; // Assuming you added Recruitment type
import { Plus } from 'lucide-react';

export default function RecruitmentPage() {
  const [recruitmentData, setRecruitmentData] = useState<Recruitment[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Recruitment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClient;

  const fetchRecruitmentData = async () => {
    const { data, error } = await supabase
      .from('recruitment')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching recruitment data:', error);
    if (data) setRecruitmentData(data as Recruitment[]);
  };

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  // Handlers for CRUD Form
  const handleOpenInsert = () => {
    setSelectedEntry(null); // Clear selected entry for 'Insert' mode
    setIsFormOpen(true);
  };
  
  const handleOpenEdit = (entry: Recruitment) => {
    setSelectedEntry(entry); // Set the entry data for 'Update' mode
    setIsFormOpen(true);
  };

  const handleFormSuccess = (action: 'inserted' | 'updated') => {
    alert(`Recruitment entry successfully ${action}.`);
    setIsFormOpen(false); // Close modal
    fetchRecruitmentData(); // Refresh data
  };

  const handleDelete = async (entryId: string | number) => { 
        // We ensure it's a number for the database call since we know recruitment IDs are int4
        const recruitmentId = typeof entryId === 'string' ? parseInt(entryId) : entryId;

        if (!confirm('Are you sure you want to delete this recruitment entry?')) return;
        
        // Use the corrected ID
        const { error } = await supabase.from('recruitment').delete().eq('id', recruitmentId); 
        
        if (error) {
            console.error('Delete error:', error);
            alert('Error deleting entry.');
        } else {
            fetchRecruitmentData();
        }
    };

  // Define Table Columns
  const columns = [
    { header: 'ID', accessorKey: 'id', render: (id: number) => id }, // Recruitment ID is int4
    { header: 'Full Name', accessorKey: 'full_name' },
    { header: 'Email', accessorKey: 'email_address' },
    { header: 'Branch', accessorKey: 'branch_department' },
    { header: 'Participated Before', accessorKey: 'participated_before', render: (val: boolean) => (val ? 'Yes' : 'No') },
    { header: 'Submitted At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">📋 Recruitment Management</h1>
      
      <div className="flex justify-between items-center">
        <ExportButton data={recruitmentData} filename="recruitment_data" />
        <button 
          onClick={handleOpenInsert} 
          className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Entry
        </button>
      </div>

      <DataTable 
        data={recruitmentData} 
        columns={columns} 
        tableName="recruitment"
        onDelete={handleDelete}
        onEdit={handleOpenEdit} 
        // Note: No onViewRegistrations for recruitment table
      />
      
      {/* CRUD Form Modal */}
      {isFormOpen && (
        <Modal onClose={() => setIsFormOpen(false)}> 
          <RecruitmentForm 
            table="recruitment" 
            initialData={selectedEntry} // Null for Insert, Data for Update
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}