import Link from 'next/link';
import type { Metadata } from 'next';
import { BOOKING_WHATSAPP_MESSAGE, bookingWhatsAppUrl } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Hypatho Lab',
  description: 'Book home sample collection on WhatsApp with Hypatho Lab.',
};

const STEPS = [
  {
    n: '01',
    title: 'Message us',
    body: 'Open WhatsApp and tell us who the collection is for. No app install, no account.',
  },
  {
    n: '02',
    title: 'Pick a slot',
    body: 'Choose a date and time window. We confirm the visit and assign a collection agent.',
  },
  {
    n: '03',
    title: 'We come to you',
    body: 'An agent arrives at the address, collects the sample, and you get updates on WhatsApp.',
  },
];

export default function Home() {
  const chatHref = bookingWhatsAppUrl(BOOKING_WHATSAPP_MESSAGE);

  return (
    <div className="marketing-page min-h-dvh">
      <header className="flex items-center justify-between gap-4 px-5 py-4 max-w-3xl mx-auto w-full">
        <p className="font-display text-lg font-semibold tracking-tight text-hp-ink">Hypatho Lab</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center min-h-11 px-4 text-sm font-semibold text-hp-ink-muted"
        >
          Staff sign in
        </Link>
      </header>

      <main className="px-5 pb-16 max-w-3xl mx-auto w-full">
        <section className="pt-6 pb-10 sm:pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-hp-copper">Home collection</p>
          <h1 className="mt-3 font-display text-[2.15rem] sm:text-5xl font-semibold leading-[1.15] text-hp-ink max-w-[18ch]">
            Book a lab visit on WhatsApp.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-hp-ink-muted leading-relaxed max-w-xl">
            Hypatho Lab collects pathology samples at home. You chat with us the same way you message family —
            we handle scheduling, the agent, and the sample run.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-14 px-6 rounded-2xl bg-hp-ink text-hp-paper text-base font-semibold"
            >
              Chat on WhatsApp
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center min-h-14 px-6 rounded-2xl border border-hp-sand-2 bg-hp-paper text-hp-ink text-base font-semibold"
            >
              How booking works
            </a>
          </div>
        </section>

        <section id="how" className="scroll-mt-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-hp-ink">Three messages. A collection at your door.</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-2xl bg-hp-paper border border-hp-sand-2 p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-hp-copper">{step.n}</p>
                <h3 className="mt-2 font-semibold text-hp-ink text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-hp-ink-muted leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-3xl bg-hp-ink px-6 py-8 text-hp-paper">
          <h2 className="font-display text-2xl font-semibold leading-snug">Ready when you are</h2>
          <p className="mt-3 text-sm sm:text-base text-hp-sand leading-relaxed max-w-md">
            Start a WhatsApp chat with Hypatho Lab. Say you want a home collection — we take it from there.
          </p>
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center min-h-14 px-6 rounded-2xl bg-hp-copper text-hp-paper text-base font-semibold w-full sm:w-auto"
          >
            Message Hypatho Lab
          </a>
        </section>
      </main>

      <footer className="px-5 py-8 border-t border-hp-sand-2 max-w-3xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-hp-ink-muted">
        <p>Hypatho Lab · pathology collection</p>
        <Link href="/login" className="font-semibold text-hp-ink min-h-11 inline-flex items-center">
          Staff sign in
        </Link>
      </footer>
    </div>
  );
}
