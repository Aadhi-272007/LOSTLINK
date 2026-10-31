export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="border-b border-border pb-8">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      )}
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}