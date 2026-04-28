import { headers } from "next/headers";

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
  chief_estimator: ["project:read", "project:write", "upload:write", "takeoff:write", "takeoff:approve", "estimate:price", "report:export"],
  estimator: ["project:read", "project:write", "upload:write", "takeoff:write", "estimate:price", "report:export"],
  reviewer: ["project:read", "takeoff:approve"],
  viewer: ["project:read"]
};

export async function getAuthContext(): Promise<AuthContext> {
  const h = await headers();
  const userId = h.get("x-user-id");
  const organizationId = h.get("x-organization-id");
  const role = (h.get("x-organization-role") ?? "viewer") as AuthContext["role"];

  if (!userId || !organizationId) {
    if (process.env.NODE_ENV !== "production") {
      const devRole = (process.env.DEV_ORGANIZATION_ROLE ?? "owner") as AuthContext["role"];
      return {
        userId: process.env.DEV_USER_ID ?? "00000000-0000-0000-0000-000000000001",
        organizationId: process.env.DEV_ORGANIZATION_ID ?? "00000000-0000-0000-0000-000000000001",
        role: devRole,
        permissions: new Set(rolePermissions[devRole] ?? rolePermissions.owner)
      };
    }
    throw new Response("Authentication required", { status: 401 });
  }

  return {
    userId,
    organizationId,
    role,
    permissions: new Set(rolePermissions[role] ?? rolePermissions.viewer)
  };
}

export function requirePermission(ctx: AuthContext, permission: Permission): void {
  if (!ctx.permissions.has(permission)) {
    throw new Response("Forbidden", { status: 403 });
  }
}
