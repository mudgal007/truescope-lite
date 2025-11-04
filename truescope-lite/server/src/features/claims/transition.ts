export type Status =
  | "unverified"
  | "under_review"
  | "verified_true"
  | "misleading"
  | "false";

const ALLOWED: Record<Status, Status[]> = {
  unverified: ["under_review"],
  under_review: ["verified_true", "misleading", "false"],
  verified_true: [],
  misleading: [],
  false: [],
};

export function canTransition(from: Status, to: Status) {
  return ALLOWED[from]?.includes(to);
}
