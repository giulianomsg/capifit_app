declare module 'nodemailer' {
  export type SendMailOptions = Record<string, unknown>;
  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }
  export default {
    createTransport: (o: Record<string, unknown>) => ({} as Transporter),
  } as unknown as {
    createTransport: (o: Record<string, unknown>) => Transporter;
  };
}
