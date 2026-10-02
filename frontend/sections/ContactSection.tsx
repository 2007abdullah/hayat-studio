"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { api, ApiError, site } from "@/lib/api";
import { Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";

export default function ContactSection() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true); setErrors({});
    try {
      await api("/contact", { method: "POST", json: fd });
      toast.success("Message sent. I'll reply soon.");
      setSent(true); form.reset();
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fields); toast.error(err.message); } else toast.error("Message not sent. Try again.");
    } finally { setBusy(false); }
  }

  return (
    <section id="contact" className="container-x grid gap-10 py-24 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="contact-title">
      <Reveal>
        <h2 id="contact-title" className="h2">Let&apos;s build something great together.</h2>
        <p className="lead mt-4">Questions before ordering? Send a message and I&apos;ll get back within one business day.</p>
        <a href={`mailto:${site.email}`} className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><Mail className="h-4 w-4 text-accent" />{site.email}</a>
      </Reveal>
      <Reveal delay={0.1}>
        <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8" noValidate>
          <Input label="Name" name="name" required autoComplete="name" error={errors.name} />
          <Input label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
          <Input label="Subject" name="subject" required className="sm:col-span-2" error={errors.subject} />
          <Textarea label="Message" name="message" required className="sm:col-span-2" error={errors.message} />
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="sm:col-span-2 flex items-center gap-4"><Button type="submit" loading={busy} arrow>Send message</Button>{sent && <p role="status" className="text-sm text-emerald-300">Thanks, your message was sent.</p>}</div>
        </form>
      </Reveal>
    </section>
  );
}
