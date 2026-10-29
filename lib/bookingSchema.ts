import { z } from "zod";
import { booking } from "@/content/site";

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Please enter a 10-digit phone number")
    .refine((v) => v.replace(/\D/g, "").length <= 15, "That phone number looks too long"),
  email: z.string().trim().email("Please enter a valid email").max(120),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Please enter a 5-digit ZIP"),
  service: z.enum(booking.services as unknown as [string, ...string[]]),
  window: z.enum(booking.windows as unknown as [string, ...string[]]),
  notes: z.string().trim().max(1000).optional().default(""),
  /** honeypot: real people never fill this in */
  company: z.string().max(0).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;
