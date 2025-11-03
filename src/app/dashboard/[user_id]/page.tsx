'use client';
import { useEffect, useState } from 'react';
import supabase from '@/api/client'; 
import { Button } from '@/components/ui/button'; 
import { useRouter } from 'next/navigation';

import EventStatsGrid from '@/components/dashboard/EventStatsGrid';
import OrganizationBox from '@/components/dashboard/OrganizationBox';
import UpcomingEventBox from '@/components/dashboard/UpcomingEventBox';
import ParticipatedEventsList from '@/components/dashboard/ParticipatedEventsList';
import HostedEventsList from '@/components/dashboard/HostedEventsList';

interface Profile {
    uuid: string;
    name: string;
    email: string;
    avatar_url: string; 
    organisation_id?: string | null;
}
interface Organization {
    id: string;
    name: string;
    details: string;
}
interface Event {
    id: string;
    name: string;
    date: string; 
    type: 'Participated' | 'Hosted';
}

const MOCK_PARTICIPATED_EVENTS: Event[] = [
    { id: 'pe1', name: 'Annual Tech Summit 2024', date: 'Dec 15, 2024', type: 'Participated' },
    { id: 'pe2', name: 'Local Coding Workshop', date: 'Nov 05, 2024', type: 'Participated' },
];

const MOCK_HOSTED_EVENTS: Event[] = [
    { id: 'he1', name: 'Supabase Data Meetup', date: 'Jan 20, 2025', type: 'Hosted' },
    { id: 'he2', name: 'Frontend Design Review', date: 'Dec 01, 2024', type: 'Hosted' },
];

const PARTICIPATED_COUNT = MOCK_PARTICIPATED_EVENTS.length;
const HOSTED_COUNT = MOCK_HOSTED_EVENTS.length;

const MOCK_UPCOMING_EVENT = { 
    name: MOCK_PARTICIPATED_EVENTS[0].name, 
    date: new Date(2025, 0, 15, 14, 30, 0)
};

interface CreateEventButtonProps {
    organization: Organization | null;
    onClick: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ organization, onClick }) => {
    const isOrganizationRegistered = !!organization;
    const router = useRouter();
    
    const handleclick = () => {
        router.push('/form/create-event');
    }

    
        return (
            <div className="relative inline-block group">
                <Button
                    onClick={handleclick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
                >
                    Create New Event
                </Button>
                {/* <span className="absolute bottom-full right-0 transform translate-x-1/2 mb-2 
                             px-3 py-1 text-xs text-white bg-gray-700 rounded-lg 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    ⚠️ Register the organization first
                </span> */}
            </div>
        );
    

};


const DashboardPage = () => {
    const router = useRouter(); 
    const [profile, setProfile] = useState<Profile | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                router.push('/login'); 
                setLoading(false);
                return;
            }
            
            const userId = session.user.id;
            
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select(`uuid, name, email, avatar_url, organisation_id, organization:organizations(id, name, description)`)
                .eq('uuid', userId)
                .single();

            if (profileError) {
                console.error(
                    "Supabase Profile Fetch Error:", 
                    profileError.message || JSON.stringify(profileError)
                );            
            }

            if (profileData) {
                const fetchedProfile: Profile = {
                    uuid: profileData.uuid,
                    name: profileData.name || 'User',
                    email: profileData.email,
                    avatar_url: profileData.avatar_url || '',
                    organisation_id: profileData.organisation_id,
                };
                setProfile(fetchedProfile);

                if (profileData.organization && Array.isArray(profileData.organization) && profileData.organization.length > 0) {
                    const orgData = profileData.organization[0];
                    setOrganization({
                        id: orgData.id,
                        name: orgData.name,
                        details: orgData.description,
                    });
                } else {
                    setOrganization(null);
                }
            }
            
            setLoading(false);
        };
        
        fetchUserData();
    }, [router]);

    const handleCreateEvent = () => {
        if (organization) {
            console.log(`Navigating to /create-event for organization: ${organization.name}`);
        }
    };

    const handleRegisterOrgClick = () => {
        router.push('/form/organisation-register');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Dashboard...</div>;
    }
    
    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <p className="text-red-400">Error: Profile data could not be loaded. Please log in again.</p>
        </div>
    );


    return (
        <div className="p-4 sm:p-6 lg:p-10 bg-gray-900">
            <div className='flex items-center justify-between mb-8'>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">Event Dashboard</h1>
                
                <CreateEventButton 
                    organization={organization}
                    onClick={handleCreateEvent}
                />
            </div>
            
            <div className="grid grid-cols-12 gap-6 mb-8">
                
                <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">User Profile</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {profile.name[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-white">{profile.name}</p>
                            <p className="text-sm text-gray-300">{profile.email}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate" title={profile.uuid}>
                                ID: {profile.uuid.substring(0, 8)}...
                            </p>
                        </div>
                    </div>
                    <button className="mt-4 text-sm text-green-400 hover:text-green-500 font-medium">
                        Edit Profile
                    </button>
                </div>

                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2">
                           <EventStatsGrid 
                                participated={PARTICIPATED_COUNT}
                                hosted={HOSTED_COUNT}
                            />
                        </div>
                        <div className="col-span-1">
                            <UpcomingEventBox event={MOCK_UPCOMING_EVENT} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                
                <div className="col-span-12 lg:col-span-4">
                    <OrganizationBox />
                </div>
                
                <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <ParticipatedEventsList 
                        events={MOCK_PARTICIPATED_EVENTS} 
                        title="List of Events Participated" 
                    />
                </div>
                
                <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <HostedEventsList 
                        events={MOCK_HOSTED_EVENTS} 
                        title="List of Events Hosted" 
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;