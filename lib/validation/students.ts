import { z } from 'zod';

export const studentInput = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  birthDate: z.coerce.date(),
  email: z.string().trim().email().or(z.literal('')).transform((value) => value || undefined),
  password: z.string().min(8).max(128).or(z.literal('')).transform((value) => value || undefined),
}).refine((data) => Boolean(data.email) === Boolean(data.password), {
  message: 'Informe e-mail e senha juntos para criar o acesso do aluno.',
  path: ['email'],
});

export const healthProfileInput = z.object({
  consentedAt: z.coerce.date(),
  restrictions: z.string().trim().min(1).max(5000),
  goals: z.string().trim().max(5000).optional(),
  observations: z.string().trim().max(5000).optional(),
});

export const functionalProgressInput = z.object({
  note: z.string().trim().min(1).max(5000),
});
