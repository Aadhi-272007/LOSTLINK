// Shared helpers: management codes, public projections and the match engine.
// Pure functions with no secrets, so both server handlers and client code can import them.

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(prefix) {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const body = Array.from(bytes)
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join("");
  return `${prefix}-${body}`;
}

export function publicView(report) {
  if (!report) return null;
  return {
    id: report.id,
    kind: report.kind,
    title: report.title,
    description: report.description,
    category: report.category,
    location: report.location,
    holding_location: report.holding_location ?? "",
    occurred_at: report.occurred_at,
    photo_url: report.photo_url ?? "",
    status: report.status,
    created_date: report.created_date,
  };
}

// Filler and restating words carry no evidence: "found in the library" should not
// dilute the words that actually describe the item.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "for", "with", "from", "by",
  "into", "near", "around", "after", "before", "over", "under", "this", "that", "these",
  "those", "it", "its", "is", "was", "were", "be", "been", "my", "mine", "me", "our", "we",
  "i", "he", "she", "they", "them", "his", "her", "their", "some", "any", "very", "really",
  "just", "also", "one", "two", "new", "old", "lost", "lose", "found", "find", "missing",
  "misplaced", "dropped", "forgot", "left", "behind", "please", "help", "someone", "anyone",
  "if", "has", "have", "had", "there", "here", "where", "when",
]);

function normalise(token) {
  // "AirPods"/"airpod", "bottles"/"bottle" should be the same word.
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function tokens(text) {
  const seen = new Set();
  for (const raw of String(text ?? "").toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    seen.add(normalise(raw));
  }
  return [...seen];
}

/**
 * Share of the shorter side's words that also appear in the longer side.
 * Containment, not Jaccard: a terse title ("id card") still matches a descriptive
 * one ("Student ID card in a clear sleeve").
 */
function similarity(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.length || !right.length) return 0;
  const shared = left.filter((token) => right.includes(token)).length;
  if (!shared) return 0;
  return Math.round((shared * 100) / Math.min(left.length, right.length));
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

/** Score a lost/found pair using the weights the how-it-works page documents. */
export function scorePair(lost, found) {
  let total = 0;
  const reasons = [];

  if (
    String(lost.category ?? "").toLowerCase() ===
    String(found.category ?? "").toLowerCase()
  ) {
    total += 35;
    reasons.push(`same category (${lost.category})`);
  }

  const titlePoints = Math.round((similarity(lost.title, found.title) * 30) / 100);
  total += titlePoints;
  if (titlePoints >= 15) reasons.push("similar item name");

  const descriptionPoints = Math.round(
    (similarity(lost.description, found.description) * 15) / 100
  );
  total += descriptionPoints;
  if (descriptionPoints >= 8) reasons.push("matching description details");

  const locationPoints = Math.round(
    (similarity(lost.location, found.location) * 12) / 100
  );
  total += locationPoints;
  if (locationPoints >= 6) reasons.push("nearby location");

  const lostAt = new Date(lost.occurred_at).getTime();
  const foundAt = new Date(found.occurred_at).getTime();
  if (Number.isFinite(lostAt) && Number.isFinite(foundAt)) {
    const diff = Math.abs(lostAt - foundAt);
    if (diff <= SEVEN_DAYS) {
      const datePoints = 8 - Math.floor((diff * 8) / SEVEN_DAYS);
      total += datePoints;
      if (datePoints >= 4) reasons.push("reported around the same time");
    }
  }

  const score = Math.min(total, 100);
  const explanation = reasons.length
    ? `Matched on ${reasons.join(", ")}.`
    : "Weak match: few shared attributes.";

  return { score, explanation };
}

export function matchId(lostId, foundId) {
  return `${lostId}__${foundId}`;
}

export function pairReports(lostReports, foundReports, minScore) {
  const pairs = [];
  for (const lost of lostReports) {
    for (const found of foundReports) {
      const { score, explanation } = scorePair(lost, found);
      if (score >= minScore) {
        pairs.push({
          id: matchId(lost.id, found.id),
          score,
          explanation,
          lost: publicView(lost),
          found: publicView(found),
        });
      }
    }
  }
  return pairs.sort((a, b) => b.score - a.score);
}