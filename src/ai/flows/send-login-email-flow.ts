
'use server';
/**
 * @fileOverview Flow para generar un mensaje de confirmación de inicio de sesión personalizado al estilo Gmail.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LoginEmailInputSchema = z.object({
  email: z.string().describe('El correo o usuario que inició sesión.'),
  role: z.string().describe('El rol del usuario (Admin, Alumno, Cocinero).'),
});
export type LoginEmailInput = z.infer<typeof LoginEmailInputSchema>;

const LoginEmailOutputSchema = z.object({
  subject: z.string().describe('Asunto del correo.'),
  body: z.string().describe('Cuerpo del mensaje de confirmación.'),
});
export type LoginEmailOutput = z.infer<typeof LoginEmailOutputSchema>;

export async function sendLoginConfirmationEmail(input: LoginEmailInput): Promise<LoginEmailOutput> {
  return sendLoginConfirmationFlow(input);
}

const loginConfirmationPrompt = ai.definePrompt({
  name: 'loginConfirmationPrompt',
  input: { schema: LoginEmailInputSchema },
  output: { schema: LoginEmailOutputSchema },
  prompt: `Eres el sistema de notificaciones inteligentes de UniEats (Cafetería UNI).
Un usuario ha accedido al sistema:
- Email/Buzón: {{{email}}}
- Perfil: {{{role}}}

Genera un correo de confirmación "Gmail-style" breve y muy amigable.
Usa un tono entusiasta similar al marketing de McDonald's: "¡Estamos felices de verte!", "¡Huele a comida deliciosa!".

Instrucciones por rol:
- Alumno/Profesor: Menciona que el menú de hoy tiene promociones especiales.
- Personal de Cocina: Deséales un turno productivo con mucha energía.
- Admin: Recuérdale que el panel de control está listo para supervisar las ventas.

El asunto debe ser atractivo (ej: "🍔 ¡Bienvenido de nuevo a UniEats!").`,
});

const sendLoginConfirmationFlow = ai.defineFlow(
  {
    name: 'sendLoginConfirmationFlow',
    inputSchema: LoginEmailInputSchema,
    outputSchema: LoginEmailOutputSchema,
  },
  async (input) => {
    const { output } = await loginConfirmationPrompt(input);
    if (!output) {
      throw new Error('No se pudo generar el mensaje de confirmación.');
    }
    
    // Simulación de envío a Gmail
    console.log(`[SIMULACIÓN GMAIL] Enviando a: ${input.email}`);
    console.log(`[ASUNTO]: ${output.subject}`);
    console.log(`[CUERPO]: ${output.body}`);
    
    return output;
  }
);
