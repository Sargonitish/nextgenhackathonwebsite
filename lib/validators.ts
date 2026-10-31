import { z } from 'zod';

// ================= Admin Validation Schemas =================

export const adminSetupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  code: z
    .string()
    .length(6, 'TOTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must contain digits only'),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyTotpSchema = z.object({
  code: z
    .string()
    .length(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain digits only'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(10, 'New password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  code: z
    .string()
    .length(6, 'TOTP code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain digits only'),
});

// ================= Organizer Validation Schemas =================

export const organizerSignupSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
    college: z.string().min(2, 'College name is required'),
    department: z.string().min(2, 'Department is required'),
    yearOrDesignation: z.string().min(1, 'Year or designation is required'),
    type: z.enum(['faculty', 'student']),
    duty: z.enum(['registration_desk', 'tech_support', 'hospitality', 'logistics', 'other']),
    note: z.string().optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().optional(),
    signupCode: z.string().optional(),
    hpField: z.string().max(0, 'Spam detected').optional(), // honeypot
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const organizerLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const organizerDecisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'reactivate', 'reset-password']),
  duty: z
    .enum(['registration_desk', 'tech_support', 'hospitality', 'logistics', 'other'])
    .optional(),
  permissions: z
    .object({
      checkin: z.boolean(),
      viewTeams: z.boolean(),
      viewContacts: z.boolean(),
    })
    .optional(),
  showOnWebsite: z.boolean().optional(),
  reason: z.string().optional(),
});

// ================= Team Registration Validation Schemas =================

export const teamMemberSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number'),
  college: z.string().min(2, 'College name is required'),
  department: z.string().min(2, 'Department is required'),
  year: z.union([z.string(), z.number()]).refine((val) => !!val, 'Year is required'),
});

export const teamRegistrationSchema = z
  .object({
    teamName: z
      .string()
      .min(3, 'Team name must be at least 3 characters')
      .max(50, 'Team name cannot exceed 50 characters'),
    track: z.string().min(1, 'Please select an innovation track'),
    members: z.array(teamMemberSchema).min(2, 'A team must have at least 2 members').max(4, 'A team can have at most 4 members'),
    agreeRules: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the hackathon rules and code of conduct' }),
    }),
    honeypot: z.string().max(0, 'Spam detected').optional(),
    leaderGoogleId: z.string().optional(),
    isGoogleVerified: z.boolean().optional(),
    googleAvatar: z.string().optional(),
  })
  .refine(
    (data) => {
      const emails = data.members.map((m) => m.email.toLowerCase().trim());
      return new Set(emails).size === emails.length;
    },
    {
      message: 'Duplicate email addresses are not allowed within the same team',
      path: ['members'],
    }
  );

// ================= Event & Timer Schemas =================

export const timerActionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  action: z.enum(['start', 'pause', 'resume', 'extend', 'end', 'reset', 'schedule']),
  value: z.number().optional(), // milliseconds to extend or schedule
  scheduledStart: z.string().optional(), // ISO string for scheduling
});
