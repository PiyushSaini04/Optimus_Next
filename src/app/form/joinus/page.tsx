'use client';

import React, { useState, FormEvent } from 'react';
import createClient from '@/api/client';
import { RecruitmentApplication } from '@/lib/types/recruitment';

// --- Static Data Definitions ---
const BRANCHES = [
  'B Tech', 'B.Sc', 'BBA', 'BA', 'BCA', 'LLB', 'B.Ed', 'B.Arch',
  'B.Des', 'B.Pharm', 'BHMCT', 'BFA', 'Other',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];

const INTERESTS = [
  'Graphic Designing & Video Editing', 'Social Media', 'Content Writing',
  'Technical team', 'Event Management', 'Marketing & PR', 'Public Speaking',
  'Aerospace', 'Photography', 'Human Resources', 'Public Relations',
];

// --- Initial State for the Form ---
const initialFormState: RecruitmentApplication = {
  full_name: '',
  registration_number: '',
  email_address: '',
  phone_number: '',
  whatsapp_number: '',
  date_of_birth: '',
  gender: '',
  residence: '',
  branch_department: '',
  course_year: '',
  areas_of_interest: [],
  participated_before: null,
  why_join_optimus: '',
};

// =========================================================
// 🟢 FIX: Move Helper Components OUTSIDE of the Page function
// =========================================================

// --- Helper Component for Input Fields (Typed for stability) ---
interface InputFieldProps {
  label: string;
  name: keyof RecruitmentApplication;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', required = false, placeholder = '', value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      required={required}
      placeholder={placeholder}
      value={value}
      // Added key for stability, though usually not required for single components
      key={name} 
      onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
    />
  </div>
);

// --- Helper Component for Select Fields (Typed for stability) ---
interface SelectFieldProps {
  label: string;
  name: keyof RecruitmentApplication;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}
const SelectField: React.FC<SelectFieldProps> = ({ label, name, required = false, value, onChange, options }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      required={required}
      value={value}
      key={name}
      onChange={onChange}
      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
    >
      <option value="" disabled>Select {label.toLowerCase()}</option>
      {options.map((option: string) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// =========================================================
// 🏁 Main Component
// =========================================================
export default function Page() {
  const [formData, setFormData] = useState<RecruitmentApplication>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Input Change Handler ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    if (name === 'participated_before') {
        setFormData(prev => ({
            ...prev,
            [name]: value === 'Yes',
        }));
        return;
    }

    // Use functional update for stability
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Checkbox Change Handler ---
  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      areas_of_interest: checked
        ? [...prev.areas_of_interest, value]
        : prev.areas_of_interest.filter((interest) => interest !== value),
    }));
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Basic Validation Check
    if (!formData.full_name || !formData.registration_number || !formData.email_address || !formData.phone_number || !formData.date_of_birth || !formData.gender || !formData.residence || !formData.branch_department || !formData.course_year || !formData.areas_of_interest.length || formData.participated_before === null || !formData.why_join_optimus) {
        setSubmitMessage({ type: 'error', text: 'Please fill in all required fields (*).' });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const supabase = createClient; 
        
        const dataToSubmit = {
            ...formData,
            participated_before: formData.participated_before !== null ? formData.participated_before : false,
        };

        const { error } = await supabase
            .from('recruitment')
            .insert([dataToSubmit]);

        if (error) {
            throw new Error(error.message);
        }
        
        setSubmitMessage({ type: 'success', text: 'Application submitted successfully! We will contact you soon.' });
        setFormData(initialFormState);
        
    } catch (error: any) {
        console.error('Submission Error:', error);
        setSubmitMessage({ type: 'error', text: `Submission failed: ${error.message || 'Please try again.'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800/90 border border-gray-700 shadow-xl rounded-xl">
      <h1 className="text-4xl md:text-5xl font-extrabold lowercase text-center text-green-400 mb-8 border-b border-gray-700 pb-3">
        Optimus Membership Application 🚀
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Personal Information --- */}
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-4 border-l-4 border-green-500 pl-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g., Jane Doe"
            />
            <InputField
              label="Registration Number"
              name="registration_number"
              required
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="e.g., 123000456"
            />
            <InputField
              label="Email Address"
              name="email_address"
              type="email"
              required
              value={formData.email_address}
              onChange={handleChange}
              placeholder="user@university.com"
            />
            <InputField
              label="Phone Number"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleChange}
              type="tel"
              placeholder="+91-XXXXXXXXXX"
            />
            <InputField
              label="WhatsApp Number (Optional)"
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleChange}
              type="tel"
            />
            <InputField
              label="Date of Birth"
              name="date_of_birth"
              required
              value={formData.date_of_birth}
              onChange={handleChange}
              type="date"
            />
          </div>

          {/* Gender and Residence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4 p-2 border border-gray-300 rounded-md bg-gray-50">
                {['Male', 'Female', 'Other'].map((g) => (
                  <label key={g} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      required
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="form-radio text-green-600 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-300">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <label htmlFor="residence" className="text-sm font-medium text-gray-700">
                Residence <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="residence"
                name="residence"
                required
                value={formData.residence}
                onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                placeholder="Hostel Block / Home Address"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
              />
            </div>
          </div>
        </section>

        <hr />

        {/* --- Academic Information --- */}
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-4 border-l-4 border-green-500 pl-3">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
                label="Branch/Department"
                name="branch_department"
                required
                value={formData.branch_department}
                onChange={handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
                options={BRANCHES}
            />
            <SelectField
                label="Course Year"
                name="course_year"
                required
                value={formData.course_year}
                onChange={handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
                options={YEARS}
            />
          </div>
        </section>

        <hr />

        {/* --- Areas of Interest --- */}
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-4 border-l-4 border-green-500 pl-3">Areas of Interest <span className="text-red-500">*</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            {INTERESTS.map((interest) => (
              <label key={interest} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={interest}
                  checked={formData.areas_of_interest.includes(interest)}
                  onChange={handleInterestChange}
                  className="form-checkbox text-green-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-300">{interest}</span>
              </label>
            ))}
          </div>
        </section>

        <hr />

        {/* --- Participation and Motivation --- */}
        <section className="space-y-6">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
                Have you participated in LPU events before? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6 p-2 border border-gray-300 rounded-md bg-gray-50 w-fit">
                <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="participated_before"
                    value="Yes"
                    required
                    checked={formData.participated_before === true}
                    onChange={handleChange}
                    className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="participated_before"
                    value="No"
                    required
                    checked={formData.participated_before === false}
                    onChange={handleChange}
                    className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label htmlFor="why_join_optimus" className="text-sm font-medium text-gray-700">
              Why do you want to join Optimus? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="why_join_optimus"
              name="why_join_optimus"
              rows={4}
              required
              value={formData.why_join_optimus}
              onChange={handleChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
              placeholder="Share your motivation and what you hope to contribute..."
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            />
          </div>
        </section>

        {/* --- Submission Message --- */}
        {submitMessage && (
            <div 
            className={`p-4 mb-4 rounded-lg text-center ${
                submitMessage.type === 'success' ? 'bg-green-900/50 text-green-400 border-green-600' : 'bg-red-900/50 text-red-400 border-red-600'
            } border transition duration-300 ease-in-out`}
            >
            {submitMessage.text}
            </div>
        )}

        {/* --- Submit Button --- */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}