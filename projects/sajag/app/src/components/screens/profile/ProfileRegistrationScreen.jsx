import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export default function ProfileRegistrationScreen({ 
  initialData = {}, 
  onBack, 
  onComplete 
}) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || 'Sahaj Sharma',
    email: initialData.email || 'sahaj.sharma@example.com',
    phone: initialData.phone || '+91 98765 43210',
    city: initialData.city || 'New Delhi (NCR)',
    emergencyContact: initialData.emergencyContact || '+91 91234 56789',
    avatar: initialData.avatar || null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoClick = () => {
    // Generate an authentic avatar photo or allow upload
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setFormData((prev) => ({ ...prev, avatar: randomAvatar }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete({
        ...formData,
        registeredAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        citizenPoints: 1250,
        co2SavedKg: 42.8,
        memberLevel: 'Gold Citizen'
      });
    }, 500);
  };

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      
      {/* 1. SCROLLABLE FORM CONTAINER */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-6 pt-5 pb-6">
        
        {/* TOP BACK BUTTON */}
        <div className="flex items-center justify-start">
          <button 
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#155DFC] hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* SCREEN TITLE & SUBTITLE */}
        <div className="text-center mt-0.5">
          <h1 className="text-[26px] sm:text-[28px] font-black text-[#0B1528] tracking-tight">
            Create your profile
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-normal">
            A few details to get you started.
          </p>
        </div>

        {/* AVATAR + ADD PHOTO */}
        <div className="flex flex-col items-center justify-center my-5">
          <div 
            onClick={handlePhotoClick}
            className="w-[96px] h-[96px] rounded-full bg-[#EBF2FE] flex items-center justify-center relative cursor-pointer group active:scale-95 transition-all shadow-xs"
            title="Click to add or change photo"
          >
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <User className="w-12 h-12 text-[#155DFC] stroke-[1.8]" />
            )}

            {/* Camera Badge at bottom right */}
            <div className="w-[30px] h-[30px] rounded-full bg-[#155DFC] text-white flex items-center justify-center border-2 border-white absolute bottom-0 right-0 shadow-sm">
              <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePhotoClick}
            className="mt-2 text-[14px] font-semibold text-[#155DFC] hover:text-[#1D4ED8] hover:underline cursor-pointer transition-colors"
          >
            {formData.avatar ? 'Change photo' : 'Add photo'}
          </button>
        </div>

        {/* FORM FIELDS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Full name */}
          <div>
            <label className="block text-[13px] font-bold text-[#101828] mb-1.5">
              Full name <span className="text-red-500">*</span>
            </label>
            <div className={`w-full bg-white border ${errors.fullName ? 'border-red-400 ring-1 ring-red-100' : 'border-[#CBD5E1]'} rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100 transition-all`}>
              <User className="w-5 h-5 text-[#64748B] shrink-0 stroke-[1.8]" />
              <input 
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Sahaj Sharma"
                className="w-full bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-gray-400"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* 2. Email address */}
          <div>
            <label className="block text-[13px] font-bold text-[#101828] mb-1.5">
              Email address <span className="text-red-500">*</span>
            </label>
            <div className={`w-full bg-white border ${errors.email ? 'border-red-400 ring-1 ring-red-100' : 'border-[#CBD5E1]'} rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100 transition-all`}>
              <Mail className="w-5 h-5 text-[#64748B] shrink-0 stroke-[1.8]" />
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="sahaj.sharma@example.com"
                className="w-full bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-gray-400"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* 3. Phone number */}
          <div>
            <label className="block text-[13px] font-bold text-[#101828] mb-1.5">
              Phone number <span className="text-red-500">*</span>
            </label>
            <div className={`w-full bg-white border ${errors.phone ? 'border-red-400 ring-1 ring-red-100' : 'border-[#CBD5E1]'} rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100 transition-all`}>
              <Phone className="w-5 h-5 text-[#64748B] shrink-0 stroke-[1.8]" />
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-gray-400"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* 4. City / region */}
          <div>
            <label className="block text-[13px] font-bold text-[#101828] mb-1.5">
              City / region <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100 transition-all relative">
              <MapPin className="w-5 h-5 text-[#64748B] shrink-0 stroke-[1.8]" />
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full bg-transparent text-[15px] font-normal text-[#101828] outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="New Delhi (NCR)">New Delhi (NCR)</option>
                <option value="Bengaluru (Karnataka)">Bengaluru (Karnataka)</option>
                <option value="Mumbai (Maharashtra)">Mumbai (Maharashtra)</option>
                <option value="Pune (Maharashtra)">Pune (Maharashtra)</option>
                <option value="Hyderabad (Telangana)">Hyderabad (Telangana)</option>
                <option value="Chennai (Tamil Nadu)">Chennai (Tamil Nadu)</option>
              </select>
              <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-1" />

          {/* 5. Emergency contact (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-bold text-[#101828]">
                Emergency contact
              </label>
              <span className="text-[12px] text-[#94A3B8]">
                Optional
              </span>
            </div>
            <div className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-3 flex items-center gap-3 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Phone className="w-5 h-5 text-[#64748B] shrink-0 stroke-[1.8]" />
              <input 
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="+91 91234 56789"
                className="w-full bg-transparent text-[15px] font-normal text-[#101828] outline-none placeholder:text-gray-400"
              />
            </div>
            <p className="text-[12px] text-[#64748B] mt-1.5 leading-normal">
              A person to contact in an emergency.
            </p>
          </div>

          {/* Footnote */}
          <p className="text-[12px] text-[#94A3B8] pt-1">
            * Required fields
          </p>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] sm:h-[56px] bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold text-[15px] sm:text-[16px] rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(37,99,235,0.28)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.36)] transition-all cursor-pointer group disabled:opacity-75 mt-3"
            aria-label="Complete registration"
          >
            <span>{isSubmitting ? 'Saving profile...' : 'Complete registration'}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.2} />
          </button>

        </form>

      </div>

    </div>
  );
}
