export const APP_NAME = "LostLink";
export const APP_TAGLINE = "Find it. Match it. Return it.";

export const NAV_LINKS = [
  { label: "Lost items", to: "/lost" },
  { label: "Found items", to: "/found" },
  { label: "Matches", to: "/matches" },
  { label: "How it works", to: "/how-it-works" },
];

export const FOOTER_LINKS = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Safety", to: "/safety" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
];

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
];

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
];

export const PAGE_SIZE = 12;

export const KIND_LABELS = { lost: "Lost", found: "Found" };

export const STATUS_LABELS = {
  active: "Active",
  hidden: "Hidden",
  removed: "Removed",
  returned: "Returned",
  withdrawn: "Withdrawn",
};

export const CLAIM_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  disputed: "Disputed",
};

export const MATCH_THRESHOLD = 40;