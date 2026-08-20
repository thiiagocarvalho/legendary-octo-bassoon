import { z } from 'zod';

export const studentInput = z.object({
  fullName: z.string().trim().min(2, 'Informe o nome completo.').max(120),
  phone: z.string().trim().min(8, 'Informe um telefone válido.').max(30),
  birthDate: z.coerce.date({ error: 'Informe uma data de nascimento válida.' }),
  email: z.string().trim().email('Informe um e-mail válido.').or(z.literal('')).transform((value) => value || undefined),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.').max(128).or(z.literal('')).transform((value) => value || undefined),
}).refine((data) => Boolean(data.email) === Boolean(data.password), {
  message: 'Informe e-mail e senha juntos para criar o acesso do aluno.',
  path: ['email'],
});

export const studentUpdateInput = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  birthDate: z.coerce.date().optional(),
}).refine((data) => Object.keys(data).length > 0, 'Informe ao menos um campo para atualizar.');

export const healthProfileInput = z.object({
  consentedAt: z.coerce.date(),
  restrictions: z.string().trim().min(1).max(5000),
  goals: z.string().trim().max(5000).optional(),
  observations: z.string().trim().max(5000).optional(),
});

export const functionalProgressInput = z.object({
  note: z.string().trim().min(1).max(5000),
});
