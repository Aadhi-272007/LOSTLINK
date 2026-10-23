import { ClaimStatus, ReportKind, ReportStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "lost"
  | "found"
  | "returned"
  | "pending"
  | "approved"
  | "rejected"
  | "disputed"
  | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  lost: "border-transparent bg-[oklch(var(--status-lost-bg))] text-[oklch(var(--status-lost-foreground))]",
  found:
    "border-transparent bg-[oklch(var(--status-found-bg))] text-[oklch(var(--status-found-foreground))]",
  returned:
    "border-transparent bg-[oklch(var(--status-returned-bg))] text-[oklch(var(--status-returned-foreground))]",
  pending:
    "border-transparent bg-[oklch(var(--status-pending-bg))] text-[oklch(var(--status-pending-foreground))]",
  approved:
    "border-transparent bg-[oklch(var(--status-approved-bg))] text-[oklch(var(--status-approved-foreground))]",
  rejected:
    "border-transparent bg-[oklch(var(--status-rejected-bg))] text-[oklch(var(--status-rejected-foreground))]",
  disputed:
    "border-transparent bg-[oklch(var(--status-disputed-bg))] text-[oklch(var(--status-disputed-foreground))]",
  neutral: "border-transparent bg-muted text-muted-foreground",
};

const KIND_TONE: Record<ReportKind, BadgeTone> = {
  [ReportKind.lost]: "lost",
  [ReportKind.found]: "found",
};

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  [ReportStatus.active]: "neutral",
  [ReportStatus.hidden]: "pending",
  [ReportStatus.withdrawn]: "neutral",
  [ReportStatus.returned]: "returned",
  [ReportStatus.removed]: "rejected",
};

const CLAIM_TONE: Record<ClaimStatus, BadgeTone> = {
  [ClaimStatus.pending]: "pending",
  [ClaimStatus.approved]: "approved",
  [ClaimStatus.rejected]: "rejected",
  [ClaimStatus.disputed]: "disputed",
};

const KIND_LABEL: Record<ReportKind, string> = {
  [ReportKind.lost]: "Lost",
  [ReportKind.found]: "Found",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  [ReportStatus.active]: "Active",
  [ReportStatus.hidden]: "Hidden",
  [ReportStatus.withdrawn]: "Withdrawn",
  [ReportStatus.returned]: "Returned",
  [ReportStatus.removed]: "Removed",
};

const CLAIM_LABEL: Record<ClaimStatus, string> = {
  [ClaimStatus.pending]: "Pending",
  [ClaimStatus.approved]: "Approved",
  [ClaimStatus.rejected]: "Rejected",
  [ClaimStatus.disputed]: "Disputed",
};

export function ReportKindBadge({
  kind,
  className,
}: { kind: ReportKind; className?: string }) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 font-semibold",
        TONE_CLASSES[KIND_TONE[kind]],
        className,
      )}
    >
      {KIND_LABEL[kind]}
    </Badge>
  );
}

export function ReportStatusBadge({
  status,
  className,
}: { status: ReportStatus; className?: string }) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 font-semibold",
        TONE_CLASSES[STATUS_TONE[status]],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function ClaimStatusBadge({
  status,
  className,
}: { status: ClaimStatus; className?: string }) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 font-semibold",
        TONE_CLASSES[CLAIM_TONE[status]],
        className,
      )}
    >
      {CLAIM_LABEL[status]}
    </Badge>
  );
}

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
