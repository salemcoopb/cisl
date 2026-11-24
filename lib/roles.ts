/**
 * Role configuration for CISL Core.
 * Swap `currentRole` for the authenticated user's role from your auth layer.
 *
 * Roles:
 *   maker   — creates / edits customers, submits for approval
 *   checker — reviews and approves/rejects pending submissions
 *   admin   — full access
 */
export type UserRole = "maker" | "checker" | "admin";

// TODO: replace with real auth context / JWT claim
export const currentRole: UserRole = "maker";

export function hasTab(tab: "customers" | "drafts" | "pending" | "submitted", role: UserRole): boolean {
  switch (tab) {
    case "customers":  return true;
    case "drafts":     return role === "maker" || role === "admin";
    case "submitted":  return role === "maker" || role === "admin";
    case "pending":    return role === "checker" || role === "admin";
  }
}
