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
  chief_estimator: ["project:read", "project:write", "upload:write", "takeoff:write", "takeoff:approve", "estimate:price", "report:export"],
  estimator: ["project:read", "project:write", "upload:write", "takeoff:write", "estimate:price", "report:export"],
  reviewer: ["project:read", "takeoff:approve"],
  viewer: ["project:read"]
};

export async function getAuthContext(): Promise<AuthContext> {
  const session = await auth();

  if (!session.userId) {
    throw Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await currentUser();
  const organizationId =
    session.orgId ??
    user?.publicMetadata?.organizationId?.toString() ??
    session.userId;

  const role =
    (session.orgRole?.replace("org:", "") as AuthContext["role"] | undefined) ??
    (user?.publicMetadata?.role as AuthContext["role"] | undefined) ??
    "owner";

  return {
    userId: session.userId,
    organizationId,
    role,
    permissions: new Set(rolePermissions[role] ?? rolePermissions.owner)
  };
}

export function requirePermission(ctx: AuthContext, permission: Permission): void {
  if (!ctx.permissions.has(permission)) {
    throw Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
