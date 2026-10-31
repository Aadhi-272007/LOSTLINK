import { CLAIM_LABELS, KIND_LABELS, STATUS_LABELS } from "@/lib/constants";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider";

const kindStyles = {
  lost: "bg-warning/10 text-warning",
  found: "bg-primary/10 text-primary",
};

const statusStyles = {
  active: "bg-primary/10 text-primary",
  returned: "bg-success/10 text-success",
  hidden: "bg-muted text-muted-foreground",
  removed: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

const claimStyles = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  disputed: "bg-warning/10 text-warning",
};

export function KindBadge({ kind }) {
  return <span className={`${base} ${kindStyles[kind] ?? kindStyles.found}`}>{KIND_LABELS[kind] ?? kind}</span>;
}

export function StatusBadge({ status }) {
  return (
    <span className={`${base} ${statusStyles[status] ?? statusStyles.active}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function ClaimBadge({ status }) {
  return (
    <span className={`${base} ${claimStyles[status] ?? claimStyles.pending}`}>
      {CLAIM_LABELS[status] ?? status}
    </span>
  );
}