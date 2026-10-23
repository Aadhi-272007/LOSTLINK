import { PageHeader } from "@/components/common/PageHeader";
import type { ReactNode } from "react";

interface ContentPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: ContentPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10 space-y-8">{children}</div>
    </div>
  );
}

export function ContentSection({
  title,
  children,
}: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
