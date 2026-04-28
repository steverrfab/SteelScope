import { auth, currentUser } from "@clerk/nextjs/server";

export type Permission =
  | "project:read"
  | "project:write"
  | "upload:write"
  | "takeoff:write"
  | "takeoff:approve"
  | "estimate:price"
  | "report:export"
  | "admin:manage";

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "chief_estimator" | "estimator" | "reviewer" | "viewer";
  permissions: Set<Permission>;
}

const rolePermissions: Record<AuthContext["role"], Permission[]> = {
  owner: ["project:read", "project:write", "upload:write", "takeoff:write", "takeoff:approve", "estimate:price", "report:export", "admin:manage"],
  admin: ["project:read", "project:write", "upload:write", "takeoff:write", "takeoff:approve", "estimate:price", "report:export", "admin:manage"],
  chief_estimator: ["project:read", "project:write", "upload:write", "takeoff:write", "takeoff:approve", "estimate:price
