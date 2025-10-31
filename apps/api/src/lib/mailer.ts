import nodemailer, { Transporter } from 'nodemailer';

type MailerConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure?: boolean;
};

let transporter: Transporter | null = null;

function getConfig(): MailerConfig {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    NODE_ENV,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error('SMTP env vars missing: SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM');
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: SMTP_FROM,
    secure: NODE_ENV === 'production' && Number(SMTP_PORT) === 465,
  };
}

export function getTransporter(): Transporter {
  if (transporter) return transporter;

  const cfg = getConfig();
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: Boolean(cfg.secure),
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  return transporter;
}

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

export async function sendMail(input: SendMailInput): Promise<void> {
  const t = getTransporter();
  try {
    await t.sendMail({
      from: getConfig().from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to send email: ${message}`);
  }
}
