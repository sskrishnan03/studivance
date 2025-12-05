import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  labelOn?: string;
  labelOff?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, labelOn = 'On', labelOff = 'Off' }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-8 w-32 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
        isOn ? 'bg-slate-700' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={isOn}
    >
      <span className="sr-only">Toggle</span>
      
      {/* Background Labels */}
      <span className={`absolute left-0 w-1/2 flex justify-center items-center text-xs font-semibold ${isOn ? 'text-slate-400' : 'text-primary-600'}`}>
         <SunIcon className={`h-4 w-4 mr-1 ${isOn ? 'text-slate-400' : 'text-yellow-500'}`}/> {labelOff}
      </span>
      <span className={`absolute right-0 w-1/2 flex justify-center items-center text-xs font-semibold ${isOn ? 'text-white' : 'text-slate-500'}`}>
         <MoonIcon className={`h-4 w-4 mr-1 ${isOn ? 'text-primary-300' : 'text-slate-400'}`}/> {labelOn}
      </span>

      {/* Switch Knob */}
      <span
        className={`absolute top-1 left-1 h-6 w-[calc(50%-4px)] bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isOn ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;