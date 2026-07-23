/** Actor autenticado que ejecuta la operación (id + rol desde el JWT). */
export interface Actor {
  id: string;
  role: string;
}

export const ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

/** Un recurso lo puede editar/eliminar su creador o un superadmin. */
export function canModifyOwned(actor: Actor, createdBy?: string | null): boolean {
  return actor.role === ROLE.SUPERADMIN || (createdBy != null && createdBy === actor.id);
}

/** ¿El actor es admin o superadmin? (sus creaciones son "compartidas"). */
export function isElevated(role: string): boolean {
  return role === ROLE.ADMIN || role === ROLE.SUPERADMIN;
}

/**
 * Protocolo de comunicación del chat:
 * user ↔ admin, admin ↔ (user + superadmin), superadmin ↔ admin.
 */
export const CHAT_PROTOCOL: Record<string, string[]> = {
  [ROLE.USER]: [ROLE.ADMIN],
  [ROLE.ADMIN]: [ROLE.USER, ROLE.SUPERADMIN],
  [ROLE.SUPERADMIN]: [ROLE.ADMIN],
};

export function canMessage(fromRole: string, toRole: string): boolean {
  return CHAT_PROTOCOL[fromRole]?.includes(toRole) ?? false;
}
