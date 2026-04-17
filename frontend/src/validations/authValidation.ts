import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[^@\s]+@[^@\s]+$/,
      "Email must contain exactly one @ symbol"
    ),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must be at most 32 characters"),

  phone: z
    .string()
    .regex(
      /^\d{10}$/,
      "Phone number must contain exactly 10 digits"
    ),
});