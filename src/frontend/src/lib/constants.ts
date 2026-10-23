import { ClaimStatus, ReportKind, ReportStatus, SortOrder } from "@/backend";

export const APP_NAME = "LostLink";
export const APP_TAGLINE = "Find It. Match It. Return It.";

export const NAV_LINKS = [
  { label: "Lost Items", to: "/lost" },
  { label: "Found Items", to: "/found" },
  { label: "Matches", to: "/matches" },
  { label: "How It Works", to: "/how-it-works" },
] as const;

export const FOOTER_LINKS = [
  { label: "How It Works", to: "/how-it-works" },
  { label: "Safety", to: "/safety" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
] as const;

export const CATEGORIES = [
  "Electronics",
  "Phone",
  "Laptop",
  "Wallet",
  "Keys",
  "Bag",
  "ID Card",
  "Books",
  "Clothing",
  "Jewellery",
  "Water Bottle",
  "Other",
] as const;

export const LOCATIONS = [
  "Main Library",
  "Student Union",
  "Science Building",
  "Engineering Hall",
  "Arts Centre",
  "Sports Complex",
  "Cafeteria",
  "Lecture Hall A",
  "Lecture Hall B",
  "Parking Lot",
  "Bus Stop",
  "Campus Green",
  "Other",
] as const;

export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;
export const DEFAULT_PAGE_SIZE = 12;

export const REPORT_KIND_LABELS: Record<ReportKind, string> = {
  [ReportKind.lost]: "Lost",
  [ReportKind.found]: "Found",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.active]: "Active",
  [ReportStatus.hidden]: "Hidden",
  [ReportStatus.withdrawn]: "Withdrawn",
  [ReportStatus.returned]: "Returned",
  [ReportStatus.removed]: "Removed",
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  [ClaimStatus.pending]: "Pending",
  [ClaimStatus.approved]: "Approved",
  [ClaimStatus.rejected]: "Rejected",
  [ClaimStatus.disputed]: "Disputed",
};

export const SORT_LABELS: Record<SortOrder, string> = {
  [SortOrder.newest]: "Newest first",
  [SortOrder.oldest]: "Oldest first",
  [SortOrder.relevance]: "Most relevant",
};

export const MANAGEMENT_CODE_STORAGE_KEY = "lostlink.managementCodes";
