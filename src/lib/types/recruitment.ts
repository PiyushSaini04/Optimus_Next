// lib/types/recruitment.ts

export type RecruitmentApplication = {
  full_name: string;
  registration_number: string;
  email_address: string;
  phone_number: string;
  whatsapp_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  residence: string;
  branch_department: string;
  course_year: string;
  areas_of_interest: string[];
  participated_before: boolean | null;
  why_join_optimus: string;
};