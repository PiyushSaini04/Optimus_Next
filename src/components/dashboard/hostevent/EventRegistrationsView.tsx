// components/dashboard/hostevent/EventRegistrationsView.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import createClient from '@/api/client';
import { CheckCircle2, XCircle, Clock, Loader2, ArrowUpDown } from 'lucide-react';

interface Registration {
  id: string;
  registration_date: string;
  is_paid: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  form_data: { [key: string]: any };
}

interface EventRegistrationsViewProps {
  eventId: string;
  onBack: () => void;
}

const EventRegistrationsView: React.FC<EventRegistrationsViewProps> = ({ eventId, onBack }) => {
  const supabase = createClient;
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filtered, setFiltered] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortPaid, setSortPaid] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('event_registrations')
        .select('form_data, status, is_paid, registration_date')
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

      if (error) {
        setError('Could not load registrations: ' + error.message);
        setRegistrations([]);
        setFiltered([]);
      } else {
        setRegistrations(data as Registration[]);
        setFiltered(data as Registration[]);
      }
      setLoading(false);
    };

    if (eventId) fetchRegistrations();
  }, [eventId]);

  // ✅ Filtering Logic (Search + Paid/Unpaid Sort)
  useEffect(() => {
    let data = [...registrations];

    // Search filter
    if (searchQuery.trim() !== '') {
      data = data.filter((reg) =>
        Object.values(reg.form_data).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort filter (Paid / Unpaid)
    if (sortPaid !== 'all') {
      data = data.filter((reg) =>
        sortPaid === 'paid' ? reg.is_paid.toLowerCase() === 'paid' : reg.is_paid.toLowerCase() !== 'paid'
      );
    }

    setFiltered(data);
  }, [searchQuery, sortPaid, registrations]);

  const formHeaders = filtered.length > 0 ? Object.keys(filtered[0].form_data) : [];

  const StatusBadge = ({ status }: { status: Registration['status'] }) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1";
    if (status === 'confirmed') return <span className={`${base} bg-green-900 text-green-400`}><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
    if (status === 'pending') return <span className={`${base} bg-yellow-900 text-yellow-400`}><Clock className="w-3 h-3" /> Pending</span>;
    return <span className={`${base} bg-red-900 text-red-400`}><XCircle className="w-3 h-3" /> Cancelled</span>;
  };

  return (
    <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-2xl min-h-[500px]">
      {/* ✅ Header & Count Section */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-3xl font-bold text-green-400">
          📝 Event Registrations ({filtered.length})
        </h2>
        <Button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-1">
          <ArrowLeftIcon className="w-4 h-4" /> <span>Back</span>
        </Button>
      </div>

      {/* ✅ Search + Filter Buttons */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Name, Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded-md w-1/3 outline-none"
        />

        <Button
          variant="secondary"
          onClick={() => setSortPaid(sortPaid === 'paid' ? 'unpaid' : 'paid')}
          className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortPaid === 'paid' ? 'Show Unpaid' : 'Show Paid'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => setSortPaid('all')}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Reset Filter
        </Button>
      </div>

      {/* ✅ Table Rendering */}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No matching results.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                {formHeaders.map((header, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800 text-white">
              {filtered.map((reg, idx) => (
                <tr key={idx} className="hover:bg-gray-700/50">
                  {formHeaders.map((field, i) => (
                    <td key={i} className="px-6 py-4 text-sm text-gray-300">{reg.form_data[field] || 'N/A'}</td>
                  ))}
                  <td className="px-6 py-4 text-sm"><StatusBadge status={reg.status} /></td>
                  <td className="px-6 py-4 text-sm">
                    {reg.is_paid.toLowerCase() === 'paid'
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <XCircle className="w-5 h-5 text-red-500" />}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(reg.registration_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationsView;
