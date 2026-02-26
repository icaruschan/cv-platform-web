import React from 'react';

export interface SocialLinks {
    x: string;
    linkedin: string;
    discord: string;
    github: string;
}

export interface ProjectEntry {
    name: string;
    role: string;
    link: string;
    impact: string;
}

export interface OnboardingData {
    fullName: string;
    role: string;
    email: string;
    tagline: string;
    experienceYears: number | '';
    bio: string;
    projects: ProjectEntry[];
    testimonials: string;
    visualStyle: string;
    heroImage: string | null; // Base64 string or URL
    socials: SocialLinks;
}

export type InputType =
    | 'text'
    | 'number'
    | 'textarea'
    | 'email'
    | 'url'
    | 'selection-card'
    | 'file'
    | 'social-multi'
    | 'project-cards'
    | 'style-picker';

export interface StyleOption {
    label: string;
    value: string;
    description: string;
    gradient: string; // CSS gradient for the card preview
}

export interface Option {
    label: string;
    value: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface QuestionConfig {
    key: keyof OnboardingData;
    step: number;
    title: string;
    subtitle: string;
    placeholder: string;
    inputType: InputType;
    required?: boolean;
    multiline?: boolean;
    minHeight?: string;
    helperText?: string;
    illustration?: React.ReactNode;
    suggestions?: string[];
    options?: Option[];
    styleOptions?: StyleOption[];
}
