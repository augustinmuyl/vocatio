# Vocatio

## Colorscheme

Only use the set of colors already defined, unless needed for a very specific need.

Do not manually change colors for light and dark mode as this is done automatically already.

Prioritize using these colors:

```css
@theme {
  --color-dark: var(--bg-dark);
  --color-bg: var(--bg);
  --color-light: var(--bg-light);
  --color-text: var(--text);
  --color-text-mute: var(--text-muted);
  --color-highlight: var(--highlight);
  --color-border: var(--border);
  --color-border-mute: var(--border-muted);
  --color-border-card: var(--border-card);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-danger: var(--danger);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-info: var(--info);
}

.shadow-custom {
  box-shadow:
    0px 2px 2px hsla(0, 0%, 0%, 0.07),
    0px 4px 4px hsla(0, 0%, 0%, 0.15);
}

.dark .shadow-custom {
  box-shadow:
    0px 2px 4px hsla(0, 0%, 0%, 0.25),
    0px 4px 8px hsla(0, 0%, 0%, 0.2);
}

.bg-gradient {
  background-image: var(--gradient);
  transition: background-image 0.3s;
}
.bg-gradient:hover {
  background-image: var(--gradient-hover);
}
```

If needed, you can use these too:

```css
@theme inline {
  /* Font families (if used) */
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  /* Core background/text */
  --color-background: var(--bg); /* main background */
  --color-foreground: var(--text); /* main text color */
  /* Muted (for backgrounds, borders, and muted text) */
  --color-muted: var(--bg-light); /* for subtle bg: cards, code blocks, etc */
  --color-muted-foreground: var(--text-muted); /* for less important text */
  /* Accent (used for selections, highlights, or accent backgrounds) */
  --color-accent: var(--highlight);
  --color-accent-foreground: var(--text);
  /* Primary (main branding/action color) */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--bg-light);
  /* Secondary (secondary actions, tags, etc) */
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--bg-light);
  /* Destructive (danger, errors) */
  --color-destructive: var(--danger);
  --color-destructive-foreground: var(--bg-light);
  /* Success/Warning/Info (if used by your component library or yourself) */
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
  /* Border/Input */
  --color-border: var(--border);
  --color-input: var(--bg-light);
  /* Focus ring */
  --color-ring: var(--highlight);
  /* Cards/Popovers (default to lightest bg, but can be tuned) */
  --color-card: var(--bg-light);
  --color-card-foreground: var(--text);
  --color-popover: var(--bg-light);
  --color-popover-foreground: var(--text);
  /* All other shadcn variables (optional, for sidebar, charts, etc) */
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  /* Border radius for components */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

All colors are set up for Tailwind CSS.
