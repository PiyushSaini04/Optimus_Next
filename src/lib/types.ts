
export interface Profile {
  uuid: string;
  name: string;
  email: string;
  avatar_url: string; 
}

export interface Organization {
  id: string;
  name: string;
  details: string; // e.g., location, mission
}

export interface Event {
  id: string;
  name: string;
  date: string; // Display date
  type: 'Participated' | 'Hosted';
  is_upcoming: boolean;
}

