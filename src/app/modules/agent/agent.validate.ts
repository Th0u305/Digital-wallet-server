import { z } from 'zod';

// --- Agent Creation Schema ---
// This schema validates the data needed to create a new user with the 'agent' role.

export const createAgentSchema = z.object({

    name: z
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: z
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    password: z
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Password must contain at least 1 number.",
        }),
    phone: z
        .string({ invalid_type_error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        }),
    address: z
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." }),  
    picture: z
        .string({ invalid_type_error: "picture must be url" })
        .max(200, { message: "url cannot exceed 200 characters." })
        .optional(),
    nidNumber: z.string().min(10, "A valid NID number is required"),
    commissionRate: z.number().positive().optional(),
    tradeLicenseNumber: z.string().default("aaaaa1234").optional(),
    
});

export const updateAgentProfileSchema = createAgentSchema.omit({email : true}).partial();
