'use server';
/**
 * @fileOverview Flow para generar un mensaje de confirmación de inicio de sesión personalizado.
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
  prompt: `Eres el asistente virtual de UniEats, la cafetería premium de la Universidad UNI.
Un usuario ha iniciado sesión con los siguientes datos:
- Usuario/Email: {{{email}}}
- Rol: {{{role}}}

Genera un mensaje de confirmación de inicio de sesión breve, entusiasta y con el estilo de McDonald's (muy amigable y enfocado en el servicio). 
Si es Alumno, menciónale que aproveche las promociones de hoy. 
Si es Cocinero, deséale una excelente y productiva jornada en los fogones.
Si es Admin, recuérdale que el panel está actualizado con las ventas en tiempo real.`,
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
    // Aquí en una app real llamaríamos a un servicio de correo (SendGrid/Resend)
    console.log(`[SIMULACIÓN DE CORREO ENVIADO A ${input.email}]`, output);
    return output;
  }
);
