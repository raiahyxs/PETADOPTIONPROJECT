import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, UploadCloud, AlertCircle, Loader2, ImagePlus, Dog, Cat, Feather, HeartHandshake, Bone, Scale, Calendar, User, BadgeAlert, MapPin, Heart, ChevronDown } from 'lucide-react'; 

// --- Configuration Data (Shared Constants) ---
const API_BASE = 'http://localhost:8000/api/pets/'; 
const DJANGO_BASE_URL = 'http://localhost:8000'; 

const SPECIES_OPTIONS = [
    { value: 'Dog', label: 'Dog', icon: Dog, color: 'text-sky-600' },
    { value: 'Cat', label: 'Cat', icon: Cat, color: 'text-violet-600' },
    { value: 'Other', label: 'Other', icon: Feather, color: 'text-green-600' },
];

const GENDER_OPTIONS = [
    { value: 'UNKNOWN', label: 'Unknown', icon: User, symbol: '' },
    { value: 'MALE', label: 'Male', icon: User, symbol: '♂' },
    { value: 'FEMALE', label: 'Female', icon: User, symbol: '♀' },
];

const initialFormData = {
    name: '',
    type: 'Dog',
    breed: '',
    age: '', 
    weight: '', 
    sex: 'UNKNOWN', 
    petImageFile: null, 
};

// --- Helper Components (Defined locally or imported) ---

const FosterLayout = ({ children }) => ( 
    <div className="min-h-screen bg-gray-50 font-inter py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, min, max, step, icon: Icon, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
            {Icon && <Icon size={16} className={`inline mr-1 ${error ? 'text-red-500' : 'text-amber-500'}`} />} 
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 transition-all shadow-sm bg-white placeholder-slate-400
                ${error 
                    ? 'border-red-500 focus:ring-red-100 focus:border-red-600'
                    : 'border-slate-200 focus:ring-amber-100 focus:border-amber-500'
                }`}
        />
        {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><BadgeAlert size={14} />{error}</p>}
    </div>
);

const SpeciesRadioGroup = ({ selectedType, onChange }) => (
    <div className="flex space-x-4">
        {SPECIES_OPTIONS.map((option) => {
            const isSelected = selectedType === option.value;
            return (
                <label 
                    key={option.value} 
                    className={`flex flex-col items-center justify-center p-3 w-1/3 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm
                        ${isSelected 
                            ? `border-amber-500 bg-amber-50 shadow-lg ${option.color} font-bold`
                            : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
                        }`}
                >
                    <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={isSelected}
                        onChange={onChange}
                        className="hidden"
                        required
                    />
                    <option.icon size={28} className="mb-1" />
                    <span className="text-sm">{option.label}</span>
                </label>
            );
        })}
    </div>
);

const PetCardPreview = React.memo(({ formData, imagePreviewUrl }) => {
    const speciesOption = SPECIES_OPTIONS.find(opt => opt.value === formData.type) || SPECIES_OPTIONS[0];
    const PetIcon = speciesOption ? speciesOption.icon : PawPrint;
    const typeColor = speciesOption ? speciesOption.color.replace('text-', 'text-') : 'text-slate-500';
    
    const genderOption = GENDER_OPTIONS.find(opt => opt.value === formData.sex);
    const sexSymbol = genderOption ? genderOption.symbol : '';
    const sexColor = genderOption ? (genderOption.value === 'MALE' ? 'text-blue-500' : genderOption.value === 'FEMALE' ? 'text-pink-500' : 'text-slate-500') : 'text-slate-500';

    const defaultImage = "https://placehold.co/400x400/D1D5DB/6B7280?text=Pet+Photo";
    const displayImage = imagePreviewUrl || defaultImage;
    const displayAge = formData.age || '?';
    const displayWeight = formData.weight ? `${formData.weight} kg` : '? kg';
    const displayName = formData.name || 'Untitled Pet';
    const displayBreed = formData.breed || 'Unknown Breed';

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 max-w-sm mx-auto md:mx-0 sticky top-20 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="relative h-56 bg-slate-200">
                <img 
                    src={displayImage} 
                    alt={`Preview of ${displayName}`} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imagePreviewUrl ? 'opacity-100' : 'opacity-70'}`}
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 text-base font-bold shadow-lg">
                    <PetIcon size={20} className={typeColor} />
                    <span className="text-slate-700">{speciesOption.label}</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full text-xl font-extrabold shadow-lg border border-slate-100">
                    <span className={sexColor}>{sexSymbol}</span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-4xl font-extrabold text-slate-800 mb-3 truncate">
                    {displayName}
                </h3>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-base text-slate-700 mt-4">
                    <div className="flex items-center">
                        <Calendar size={18} className="text-amber-500 mr-2 shrink-0" />
                        <span className="font-bold">{displayAge} years old</span>
                    </div>
                    <div className="flex items-center">
                        <Scale size={18} className="text-amber-500 mr-2 shrink-0" />
                        <span className="font-bold">{displayWeight}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                        <Bone size={18} className="text-amber-500 mr-2 shrink-0" />
                        <span className="truncate text-slate-600">{displayBreed}</span>
                    </div>
                    <div className="flex items-center col-span-2 text-slate-500">
                        <MapPin size={18} className="text-slate-400 mr-2 shrink-0" />
                        <span>Adoption Location Pending</span>
                    </div>
                </div>

                <div
                    className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-lg font-bold rounded-xl bg-amber-500 text-white opacity-70 cursor-not-allowed shadow-md"
                >
                    <Heart size={20} className="fill-white" />
                    Preview Mode
                </div>
            </div>
        </div>
    );
});


// --- Main Component ---
const AddPetPage = () => { 
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); 
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({}); 
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [submittedPetName, setSubmittedPetName] = useState(''); 
    const [submittedPetImage, setSubmittedPetImage] = useState(null); 

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleRemovePhoto = useCallback(() => {
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setFormData(prevData => ({ ...prevData, petImageFile: null }));
        setImagePreviewUrl(null);
    }, [imagePreviewUrl]); 
    
    const handleResetForm = useCallback(() => {
        setFormData(initialFormData);
        handleRemovePhoto();
        setSubmittedPetImage(null);
        setSubmittedPetName('');
        setSubmissionStatus(null);
        setError('');
        setFieldErrors({});
    }, [handleRemovePhoto]);


    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setSubmissionStatus(null);
        setError('');
        setFieldErrors(prev => ({ ...prev, [name]: '' })); 
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        setSubmissionStatus(null);
        setError('');
        setFieldErrors(prev => ({ ...prev, petImageFile: '' }));

        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                setFieldErrors(prev => ({ ...prev, petImageFile: 'Photo must be smaller than 5MB.' }));
                return;
            }
            setFormData(prevData => ({
                ...prevData,
                petImageFile: file
            }));
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            const newPreviewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(newPreviewUrl);
        } else {
            handleRemovePhoto(); 
        }
    }, [imagePreviewUrl, handleRemovePhoto]); 

    const validateForm = useCallback(() => {
        let isValid = true;
        const newFieldErrors = {};

        if (!formData.name.trim()) {
            newFieldErrors.name = "Pet name is required.";
            isValid = false;
        }
        if (formData.age < 0 || formData.age > 30 || formData.age === '') {
            newFieldErrors.age = "Please enter a valid age (0-30).";
            isValid = false;
        }
        if (formData.weight !== '' && (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 100)) {
            newFieldErrors.weight = "Weight must be between 0.1 and 100 kg.";
            isValid = false;
        }
        
        setFieldErrors(newFieldErrors);
        return isValid;
    }, [formData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError("Please correct the highlighted errors before submitting.");
            setSubmissionStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus(null);
        setError('');

        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('type', formData.type);
        dataToSend.append('breed', formData.breed);
        dataToSend.append('age', parseInt(formData.age, 10)); 
        dataToSend.append('sex', formData.sex); 

        if (formData.weight) {
            dataToSend.append('weight', parseFloat(formData.weight)); 
        }

        if (formData.petImageFile) {
            dataToSend.append('image', formData.petImageFile); 
        }
        
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                body: dataToSend,
            });

            const result = await response.json();

            if (response.ok) {
                setSubmittedPetName(result.name || formData.name); 

                const returnedPhotoPath = result.photo || result.image; 
                if (returnedPhotoPath) {
                    let photoUrl = returnedPhotoPath;
                    if (!photoUrl.startsWith('http')) {
                        const pathFragment = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
                        photoUrl = `${DJANGO_BASE_URL}/${pathFragment}`; 
                    }
                    setSubmittedPetImage(photoUrl);
                } else {
                    setSubmittedPetImage(imagePreviewUrl); 
                }
                
                setSubmissionStatus('success');
                
                // Redirects to the Pet List Page after successful submission
                setTimeout(() => {
                    navigate('/foster-pet-list'); 
                }, 1500); 

            } else {
                console.error("API Error Response:", result);
                if (result && typeof result === 'object') {
                    const apiFieldErrors = {};
                    for (const [key, value] of Object.entries(result)) {
                        const localKey = (key === 'photo' || key === 'image') ? 'petImageFile' : key;
                        apiFieldErrors[localKey] = Array.isArray(value) ? value.join(', ') : String(value);
                    }
                    setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }));
                }
                setError(result.detail || result.error || 'Failed to submit pet data. Please check the fields and try again.');
                setSubmissionStatus('error');
            }
        } catch (err) {
            console.error('Network or unexpected error:', err);
            setError('A network error occurred. Please try again.');
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const petNameForMessage = useMemo(() => submittedPetName || formData.name.trim() || 'your pet', [formData.name, submittedPetName]);


    return (
        <FosterLayout>
            <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-3xl shadow-amber-200/50 border border-amber-100">
                
                <header className="mb-12 text-center">
                    <div className="inline-block p-4 rounded-full bg-amber-100 text-amber-600 shadow-xl mb-4">
                        <HeartHandshake size={44} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">List a Foster Pet</h1>
                    <p className="text-lg text-slate-500 mt-3 max-w-xl mx-auto">
                        Enter the details for your foster pet and see a live preview of your listing on the right!
                    </p>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        
                        <div className="lg:col-span-2 space-y-8 md:order-1">
                            
                            <h2 className="text-3xl font-bold text-slate-700 border-b-2 border-amber-100 pb-3">
                                Pet Basics & Details
                            </h2>

                            <InputField 
                                label="Pet's Name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="e.g., Sparky, Luna, or Professor Paws" 
                                required 
                                icon={PawPrint}
                                error={fieldErrors.name}
                            />
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Species (Type) <span className="text-red-500">*</span>
                                </label>
                                <SpeciesRadioGroup 
                                    selectedType={formData.type} 
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <InputField 
                                    label="Age (Years)" 
                                    name="age" 
                                    type="number" 
                                    value={formData.age} 
                                    onChange={handleChange} 
                                    min="0"
                                    max="30"
                                    placeholder="e.g., 2" 
                                    required 
                                    icon={Calendar}
                                    error={fieldErrors.age}
                                />
                                
                                <InputField 
                                    label="Weight (kg)" 
                                    name="weight" 
                                    type="number" 
                                    value={formData.weight} 
                                    onChange={handleChange} 
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="e.g., 15.5" 
                                    icon={Scale}
                                    error={fieldErrors.weight}
                                />
                                
                                <div>
                                    <label htmlFor="sex" className="block text-sm font-semibold text-slate-700 mb-2">
                                        <User size={16} className="inline mr-1 text-amber-500" />
                                        Sex <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="sex"
                                            id="sex"
                                            value={formData.sex}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all bg-white shadow-sm appearance-none pr-10"
                                        >
                                            {GENDER_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label} {option.symbol}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <InputField 
                                label="Breed" 
                                name="breed" 
                                value={formData.breed} 
                                onChange={handleChange} 
                                placeholder="e.g., Beagle, Siamese, Mixed" 
                                icon={Bone}
                            />

                            <h2 className="text-3xl font-bold text-slate-700 border-b-2 border-amber-100 pb-3 mt-10">
                                Pet Photo
                            </h2>
                            <label 
                                htmlFor="petImageFile" 
                                className={`block w-full cursor-pointer rounded-xl p-4 text-center transition-colors shadow-lg 
                                    ${formData.petImageFile 
                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                        : 'border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="petImageFile" 
                                    name="petImageFile" 
                                    accept="image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                
                                <div className='flex items-center justify-center gap-2 font-black text-xl'>
                                    <UploadCloud size={24} />
                                    <span>{formData.petImageFile ? 'Change Photo' : 'Select Main Pet Photo'}</span> 
                                </div>
                                <p className='text-sm mt-1 opacity-80'>Square image works best (JPG/PNG, max 5MB)</p>
                            </label>
                            {fieldErrors.petImageFile && ( 
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-semibold">
                                    <BadgeAlert size={16} />{fieldErrors.petImageFile}
                                </p>
                            )}

                        </div>
                        
                        <div className="lg:col-span-1 md:order-2">
                            <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
                                <ImagePlus size={24} className="text-amber-600" />
                                Live Listing Preview
                            </h2>
                            <PetCardPreview 
                                formData={formData} 
                                imagePreviewUrl={imagePreviewUrl} 
                            />
                        </div>
                        
                    </div>
                    
                    <hr className="border-amber-100" />

                    {submissionStatus === 'success' && (
                        <div className="flex flex-col items-center p-8 bg-green-50 text-green-800 rounded-2xl font-semibold border border-green-300 shadow-lg mt-8">
                            
                            <div className='text-xl font-bold flex items-center gap-3 mb-4 text-green-700'>
                                <Loader2 size={28} className="animate-spin text-green-600" />
                                Successfully Listed!
                            </div>
                            <p className='text-lg'>Pet **{petNameForMessage}** is now available for fostering. Redirecting to Pet List in a moment...</p>
                        </div>
                    )}

                    {submissionStatus === 'error' && (
                        <div className="flex items-start p-5 bg-red-50 text-red-800 rounded-2xl font-semibold border border-red-300 shadow-lg mt-8">
                            <AlertCircle size={24} className="mr-4 shrink-0 mt-0.5 text-red-600" />
                            <div>
                                <p className='text-lg'>Submission Error:</p>
                                <p className='text-base font-medium'>{error}</p>
                                {Object.entries(fieldErrors).filter(([key, value]) => key !== 'name' && value).length > 0 && (
                                    <ul className="mt-2 text-sm list-disc pl-5">
                                        {Object.entries(fieldErrors).filter(([key, value]) => key !== 'name' && value).map(([key, value]) => (
                                            <li key={key}>**{key}**: {value}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || submissionStatus === 'success'}
                        className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-2xl text-white transition-all duration-300 shadow-2xl mt-12 
                        ${
                            isSubmitting || submissionStatus === 'success'
                                ? 'bg-slate-400 cursor-not-allowed shadow-slate-300/50'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-400/70 hover:scale-[1.005] active:scale-99'
                        }`}
                    >
                        {isSubmitting || submissionStatus === 'success' ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                {submissionStatus === 'success' ? 'Redirecting...' : 'Processing Submission...'}
                            </>
                        ) : (
                            <>
                                <PawPrint size={28} />
                                Finalize & Submit Pet Listing
                            </>
                        )}
                    </button>
                </form>
                
            </div>
        </FosterLayout>
    );
};


export default AddPetPage;