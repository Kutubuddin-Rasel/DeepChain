export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/5 bg-white">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-8 text-[11px] text-foreground/60">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[14px] font-bold tracking-tight text-primary">
            Foodio
            <span className="text-foreground">.</span>
          </span>
          <span>© 2026 Foodio Inc.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
