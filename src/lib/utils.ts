import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useCurrentUser() {
  const user = useQuery(api.auth.loggedInUser);
  return user;
}

// Enhanced utility functions for auth components
export const authUtils = {
  getInputClasses: (extraClasses?: string) => 
    cn(
      "w-full px-4 py-3 rounded-lg bg-white border border-gray-300",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      "outline-none transition-all duration-200 shadow-sm hover:shadow-sm focus:shadow-md",
      "dark:bg-dark-card dark:border-dark-border dark:text-dark-text",
      extraClasses
    ),
  
  getButtonClasses: (variant: 'primary' | 'secondary' = 'primary', extraClasses?: string) => 
    cn(
      "px-5 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md",
      variant === 'primary' 
        ? "bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-card/50",
      extraClasses
    ),
};