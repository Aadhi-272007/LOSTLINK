export default function ContentPage({ eyebrow, title, intro, sections, footer }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <header className="border-b border-border pb-8">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{intro}</p>
      </header>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold tracking-tight">{section.heading}</h2>
            <div className="mt-2 space-y-2">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-foreground/85">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/85">
                {section.list.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}