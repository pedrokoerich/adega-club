import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set, emails will not be sent");
    return null;
  }
  return new Resend(key);
}

export async function sendPriceAlert({
  to,
  wineName,
  oldPrice,
  newPrice,
  store,
  slug,
}: {
  to: string;
  wineName: string;
  oldPrice: number;
  newPrice: number;
  store: string;
  slug: string;
}) {
  const resend = getResend();
  if (!resend) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://adega.club";

  return resend.emails.send({
    from: "Adega Club <alertas@adega.club>",
    to,
    subject: `${wineName} baixou de preco!`,
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #7b1d3a; font-size: 24px;">
          Alerta de Preco
        </h1>
        <p style="color: #2c2420; font-size: 16px;">
          <strong>${wineName}</strong> baixou de preco na <strong>${store}</strong>!
        </p>
        <div style="background: #f0ebe3; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #8a7e72; font-size: 14px; margin: 0 0 4px;">Antes</p>
          <p style="color: #8a7e72; font-size: 20px; text-decoration: line-through; margin: 0;">
            R$ ${oldPrice.toFixed(2)}
          </p>
          <p style="color: #8a7e72; font-size: 14px; margin: 12px 0 4px;">Agora</p>
          <p style="color: #2d6a4f; font-size: 28px; font-weight: bold; margin: 0;">
            R$ ${newPrice.toFixed(2)}
          </p>
        </div>
        <a href="${appUrl}/vinhos/${slug}" style="display: inline-block; background: #7b1d3a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Ver comparacao
        </a>
        <hr style="border: none; border-top: 1px solid #e0d8ce; margin: 24px 0;" />
        <p style="color: #8a7e72; font-size: 12px;">
          <a href="${appUrl}/painel" style="color: #7b1d3a;">Gerenciar alertas</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcome({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const resend = getResend();
  if (!resend) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://adega.club";

  return resend.emails.send({
    from: "Adega Club <ola@adega.club>",
    to,
    subject: "Bem-vindo ao Adega Club!",
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #7b1d3a; font-size: 28px;">
          Bem-vindo, ${name}!
        </h1>
        <p style="color: #2c2420; font-size: 16px; line-height: 1.6;">
          Estamos felizes em ter voce no Adega Club. Agora voce pode comparar precos de vinhos
          sul-americanos e criar alertas para economizar.
        </p>
        <a href="${appUrl}/vinhos" style="display: inline-block; background: #7b1d3a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px;">
          Explorar vinhos
        </a>
      </div>
    `,
  });
}
