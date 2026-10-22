import { Link } from "@tanstack/react-router";
import { Check, Lightbulb, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/validate", label: "Validate Idea" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "My Reports" },
  { to: "/compare", label: "Compare" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const enabled = window.localStorage.getItem("ideavalidate.theme") === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("ideavalidate.theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            <span className="relative grid size-5 place-items-center" aria-hidden="true">
              <Lightbulb className="size-5" />
              <Check className="absolute top-1 size-2.5 stroke-[3]" />
            </span>
          </span>
          Startup Idea Validator
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:font-semibold data-[status=active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} onClick={toggleTheme}>
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/validate">Validate My Idea</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-3 lg:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="block rounded-md px-3 py-2 text-sm data-[status=active]:bg-secondary data-[status=active]:font-semibold"
            >
              {n.label}
            </Link>
          ))}
          <Button asChild className="mt-2 w-full">
            <Link to="/validate" onClick={() => setOpen(false)}>Validate My Idea</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card print:hidden">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="font-display font-semibold">Startup Idea Validator</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This frontend prototype stores saved ideas in the browser's localStorage. Data is not uploaded to a server.
            Clearing browser data may delete saved records.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end" aria-label="Footer">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/how-it-works" className="hover:text-primary">How It Works</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
          <Link to="/compare" className="hover:text-primary">Compare scenarios</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy Notice</Link>
        </nav>
      </div>
      <p className="pb-6 text-center text-xs text-muted-foreground">A practical workspace for exploring business ideas.</p>
    </footer>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2 print:hidden">{children}</div>}
    </div>
  );
}
