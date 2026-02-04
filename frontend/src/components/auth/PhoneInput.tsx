import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { cn, isValidPhone } from '@/lib/utils';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CD', name: 'DR Congo', dialCode: '+243', flag: '🇨🇩' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PhoneInput({
  value,
  countryCode,
  onChange,
  error,
  disabled,
  autoFocus,
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const cleaned = e.target.value.replace(/\D/g, '');
    onChange(cleaned, countryCode);
  };

  const selectCountry = (country: Country) => {
    onChange(value, country.code);
    setShowDropdown(false);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const isValid = value.length > 0 && isValidPhone(value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={cn(
          'flex items-center gap-2 bg-dark-800 border rounded-xl overflow-hidden transition-colors',
          error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-dark-700',
          'focus-within:border-primary-500'
        )}
      >
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-3 bg-dark-700/50 hover:bg-dark-700 transition-colors"
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="text-white text-sm">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-4 h-4 text-dark-400" />
        </button>

        {/* Phone input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder="Phone number"
          className="flex-1 bg-transparent py-3 pr-4 text-white placeholder-dark-400 outline-none"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}

      {/* Country dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-xl"
          >
            {/* Search */}
            <div className="p-3 border-b border-dark-700">
              <div className="flex items-center gap-2 bg-dark-900 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-dark-400 outline-none"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => selectCountry(country)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors',
                    country.code === countryCode && 'bg-dark-700'
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="flex-1 text-left text-white">{country.name}</span>
                  <span className="text-dark-400">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
