// /src/components/ui/Modal.tsx
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative bg-gray-800/90 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-green-400 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        {children}
      </div>
    </div>
  );
}