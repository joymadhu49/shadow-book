export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="pt-10 pb-8 border-b border-[var(--mb-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--mb-accent)] font-semibold">
          <span className="w-1 h-1 rounded-full bg-[var(--mb-accent)]" />
          {eyebrow}
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-[var(--mb-text-secondary)] text-[14px] leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
