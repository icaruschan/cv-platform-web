import React, { useRef, useEffect, useState } from 'react';
import { Plus, UploadCloud, X, Image as ImageIcon, Github, Linkedin, Trash2 } from 'lucide-react';
import { Option, SocialLinks, ProjectEntry, StyleOption } from '../types';

interface BaseInputProps {
  value: any;
  onChange: (value: any) => void;
  onEnter?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// -- Helpers --

export const PillGroup: React.FC<{
  suggestions: string[];
  onSelect: (val: string) => void;
}> = ({ suggestions, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition-all active:scale-95"
        >
          {suggestion.startsWith('+') ? suggestion : `+ ${suggestion}`}
        </button>
      ))}
    </div>
  );
};

export const SelectionCards: React.FC<{
  options: Option[];
  selectedValue: string;
  onSelect: (val: string) => void;
}> = ({ options, selectedValue, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {options.map((opt) => {
        const isActive = selectedValue === opt.value;

        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
            className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 group
              ${isActive
                ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-600'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
          >
            <div className={`mb-3 p-2 rounded-lg ${isActive ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
              {opt.icon}
            </div>
            <span className={`font-semibold text-sm mb-1 ${isActive ? 'text-orange-900' : 'text-gray-900'}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// -- Components --

export const TextInput: React.FC<BaseInputProps & { suggestions?: string[] }> = ({ value, onChange, onEnter, placeholder, autoFocus, suggestions }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handlePillSelect = (text: string) => {
    const cleanText = text.replace(/^\+\s*/, '');
    onChange(cleanText);
  };

  return (
    <div className="group relative">
      <input
        ref={inputRef}
        type="text"
        className="block w-full px-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
        placeholder={placeholder}
        value={value === null ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      {suggestions && <PillGroup suggestions={suggestions} onSelect={handlePillSelect} />}
    </div>
  );
};

export const NumberInput: React.FC<BaseInputProps> = ({ value, onChange, onEnter, placeholder, autoFocus }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="group relative">
      <input
        ref={inputRef}
        type="number"
        min="0"
        className="block w-full px-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
        placeholder={placeholder}
        value={value === '' || value === null ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
    </div>
  );
};

interface TextAreaProps extends BaseInputProps {
  minHeight?: string;
  suggestions?: string[];
  options?: Option[];
}

export const TextAreaInput: React.FC<TextAreaProps> = ({ value, onChange, placeholder, minHeight = 'h-32', autoFocus, suggestions, options }) => {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && areaRef.current) {
      areaRef.current.focus();
    }
  }, [autoFocus]);

  const handlePillSelect = (text: string) => {
    const cleanText = text.replace(/^\+\s*/, '');
    const currentVal = value ? value.toString() : '';
    const newVal = currentVal ? `${currentVal} ${cleanText}` : cleanText;
    onChange(newVal);
    if (areaRef.current) areaRef.current.focus();
  };

  const handleOptionSelect = (optValue: string) => {
    onChange(optValue);
  };

  return (
    <div className="group relative">
      {options && (
        <SelectionCards
          options={options}
          selectedValue={value ? value.toString() : ''}
          onSelect={handleOptionSelect}
        />
      )}

      <textarea
        ref={areaRef}
        className={`block w-full px-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none placeholder-gray-400 ${minHeight}`}
        placeholder={placeholder}
        value={value === null ? '' : value}
        onChange={(e) => onChange(e.target.value)}
      />

      {suggestions && (
        <div className="mt-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Quick Select Keywords</span>
          <PillGroup suggestions={suggestions} onSelect={handlePillSelect} />
        </div>
      )}
    </div>
  );
};

export const FileUploadInput: React.FC<BaseInputProps> = ({ value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Return base64 string
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        className={`relative w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${dragActive ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-gray-100'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="image/*"
        />

        {value ? (
          <>
            <img src={value as string} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white font-medium">Click to change</p>
            </div>
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-colors z-10"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <div className="text-center p-6 pointer-events-none">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">Click to upload hero image</p>
            <p className="text-sm text-gray-500">or drag and drop SVG, PNG, JPG</p>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-flex">
          <ImageIcon size={16} />
          <span className="text-sm font-medium">Image uploaded successfully</span>
        </div>
      )}
    </div>
  );
};

export const SocialLinksInput: React.FC<BaseInputProps> = ({ value, onChange, autoFocus }) => {
  const socials = value as SocialLinks || { x: '', linkedin: '', discord: '', github: '' };

  const handleChange = (key: keyof SocialLinks, text: string) => {
    onChange({
      ...socials,
      [key]: text
    });
  };

  // SVGs for specific branding
  const XIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  );

  const DiscordIcon = () => (
    <svg viewBox="0 0 127.14 96.36" className="w-5 h-5 fill-current">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c.12-15.56-4.09-35.56-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );

  return (
    <div className="space-y-4">

      {/* X (Twitter) */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
          <XIcon />
        </div>
        <input
          type="text"
          autoFocus={autoFocus}
          value={socials.x}
          onChange={(e) => handleChange('x', e.target.value)}
          placeholder="https://x.com/username"
          className="block w-full pl-12 pr-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 placeholder-gray-400"
        />
      </div>

      {/* LinkedIn */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-orange-600/60 group-focus-within:text-orange-600 transition-colors">
          <Linkedin size={20} />
        </div>
        <input
          type="text"
          value={socials.linkedin}
          onChange={(e) => handleChange('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="block w-full pl-12 pr-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
        />
      </div>

      {/* Discord */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-indigo-500/60 group-focus-within:text-indigo-500 transition-colors">
          <DiscordIcon />
        </div>
        <input
          type="text"
          value={socials.discord}
          onChange={(e) => handleChange('discord', e.target.value)}
          placeholder="Discord Username (e.g. user#1234)"
          className="block w-full pl-12 pr-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
        />
      </div>

      {/* Github */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-slate-600/60 group-focus-within:text-slate-900 transition-colors">
          <Github size={20} />
        </div>
        <input
          type="text"
          value={socials.github}
          onChange={(e) => handleChange('github', e.target.value)}
          placeholder="https://github.com/username"
          className="block w-full pl-12 pr-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 placeholder-gray-400"
        />
      </div>

    </div>
  );
};

// -- Project Cards Input --

const EMPTY_PROJECT: ProjectEntry = { name: '', role: '', link: '', impact: '' };

export const ProjectCardsInput: React.FC<BaseInputProps> = ({ value, onChange }) => {
  const projects: ProjectEntry[] = Array.isArray(value) && value.length > 0 ? value : [{ ...EMPTY_PROJECT }];

  const updateProject = (index: number, field: keyof ProjectEntry, text: string) => {
    const updated = projects.map((p, i) => i === index ? { ...p, [field]: text } : p);
    onChange(updated);
  };

  const addProject = () => {
    onChange([...projects, { ...EMPTY_PROJECT }]);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) return;
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {projects.map((project, idx) => (
        <div
          key={idx}
          className="relative p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500">
              Project {idx + 1}
            </span>
            {projects.length > 1 && (
              <button
                onClick={() => removeProject(idx)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          {/* 2x2 grid of fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateProject(idx, 'name', e.target.value)}
              placeholder="Project / Company name"
              className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400"
              autoFocus={idx === 0}
            />
            <input
              type="text"
              value={project.role}
              onChange={(e) => updateProject(idx, 'role', e.target.value)}
              placeholder="Your role (e.g. Lead Designer)"
              className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400"
            />
            <input
              type="text"
              value={project.link}
              onChange={(e) => updateProject(idx, 'link', e.target.value)}
              placeholder="Link or handle (e.g. https://...)"
              className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400"
            />
            <input
              type="text"
              value={project.impact}
              onChange={(e) => updateProject(idx, 'impact', e.target.value)}
              placeholder="Impact (e.g. 10x community growth)"
              className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400"
            />
          </div>
        </div>
      ))}

      {/* Add another button */}
      <button
        onClick={addProject}
        className="flex items-center gap-2 w-full justify-center py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all text-sm font-medium"
      >
        <Plus size={18} />
        Add another project
      </button>
    </div>
  );
};

// -- Style Picker Input --

export const StylePickerInput: React.FC<BaseInputProps & { styleOptions?: StyleOption[]; minHeight?: string }> = ({
  value,
  onChange,
  placeholder,
  styleOptions = [],
  minHeight = 'h-32',
}) => {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Determine initial selected style from value
  useEffect(() => {
    if (value && styleOptions.length > 0) {
      const match = styleOptions.find((s) => s.description === value);
      if (match) setSelectedStyle(match.value);
    }
  }, []);

  const handleStyleClick = (style: StyleOption) => {
    setSelectedStyle(style.value);
    onChange(style.description);
    // Focus the textarea so user can customize
    setTimeout(() => areaRef.current?.focus(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {styleOptions.map((style) => {
          const isActive = selectedStyle === style.value;
          return (
            <button
              key={style.value}
              onClick={() => handleStyleClick(style)}
              className={`group relative flex flex-col items-center rounded-xl border-2 p-1 transition-all duration-200 overflow-hidden
                ${isActive
                  ? 'border-orange-600 ring-2 ring-orange-600/30 scale-[1.02]'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                }`}
            >
              {/* Gradient preview */}
              <div
                className="w-full h-20 rounded-lg mb-2"
                style={{ background: style.gradient }}
              />
              <span
                className={`text-xs font-semibold pb-2 ${isActive ? 'text-orange-700' : 'text-gray-700'}`}
              >
                {style.label}
              </span>
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Editable textarea */}
      <textarea
        ref={areaRef}
        className={`block w-full px-4 py-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none placeholder-gray-400 ${minHeight}`}
        placeholder={placeholder}
        value={value === null ? '' : value}
        onChange={(e) => {
          onChange(e.target.value);
          // If user edits, we might unselect the style card
          const match = styleOptions.find((s) => s.description === e.target.value);
          setSelectedStyle(match ? match.value : null);
        }}
      />
    </div>
  );
};
