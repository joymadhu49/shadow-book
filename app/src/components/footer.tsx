export function Footer() {
  return (
    <footer className="border-t border-[var(--mb-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-between text-[11px] text-[var(--mb-text-muted)]">
        <div className="flex items-center gap-3">
          <a href="https://earn.superteam.fun/listing/privacy-track-colosseum-hackathon-powered-by-magicblock-st-my-and-sns/" target="_blank" className="hover:text-[var(--mb-accent)] transition-colors">
            Colosseum × MagicBlock
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://docs.magicblock.gg" target="_blank" className="hover:text-[var(--mb-accent)] transition-colors">Docs</a>
          <a href="https://github.com/magicblock-labs" target="_blank" className="hover:text-[var(--mb-accent)] transition-colors">GitHub</a>
          <span className="text-[var(--mb-text-secondary)]">Powered by <span className="text-[var(--mb-accent)] font-semibold">MagicBlock</span></span>
        </div>
      </div>
    </footer>
  );
}
