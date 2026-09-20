/**
 * Cloudflare Pages Function — POST /api/contact
 * Forwards a contact-form enquiry by email via Resend.
 *
 * Required environment variables (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY — Resend API key
 *   TO_EMAIL       — where enquiries are delivered, e.g. info@nuador.co
 *   FROM_EMAIL     — verified sender, e.g. "Nuador <onboarding@resend.dev>"
 */

export async function onRequestPost({ request, env }) {
  let data;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }
  } else {
    const fd = await request.formData();
    data = Object.fromEntries(fd.entries());
  }

  const name = String(data?.name || "").trim();
  const email = String(data?.email || "").trim();
  const topic = String(data?.topic || "").trim();
  const message = String(data?.message || "").trim();
  const whatsapp = String(data?.whatsapp || "").trim();
  const line = String(data?.line || "").trim();
  const telegram = String(data?.telegram || "").trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please fill in your name, email and message." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  const to = env.TO_EMAIL || "info@nuador.co";
  const from = env.FROM_EMAIL || "Nuador <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `[Nuador] New enquiry from ${name}`,
      text:
        `Name: ${name}\nEmail: ${email}\nTopic: ${topic || "—"}\n` +
        `${whatsapp ? `WhatsApp: ${whatsapp}\n` : ""}` +
        `${line ? `LINE: ${line}\n` : ""}` +
        `${telegram ? `Telegram: ${telegram}\n` : ""}` +
        `\n${message}`,
      html:
        `<h3>New enquiry — Nuador</h3>` +
        `<p><b>Name:</b> ${esc(name)}</p>` +
        `<p><b>Email:</b> ${esc(email)}</p>` +
        `<p><b>Topic:</b> ${esc(topic || "—")}</p>` +
        (whatsapp ? `<p><b>WhatsApp:</b> ${esc(whatsapp)}</p>` : "") +
        (line ? `<p><b>LINE:</b> ${esc(line)}</p>` : "") +
        (telegram ? `<p><b>Telegram:</b> ${esc(telegram)}</p>` : "") +
        `<p>${esc(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    return json(
      { ok: false, error: "Message could not be sent. Please email us directly." },
      502
    );
  }

  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
