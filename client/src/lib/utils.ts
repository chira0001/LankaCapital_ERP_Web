import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
//new utility function for merging class names with Tailwind CSS, using clsx and tailwind-merge. This allows for conditional class names and resolves conflicts in Tailwind classes.
