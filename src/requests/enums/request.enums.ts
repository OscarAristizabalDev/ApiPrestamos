/** Naturaleza de la solicitud. Extensible: agrega nuevos tipos aquí. */
export enum RequestType {
  PRODUCT_TYPE_CREATE = 'PRODUCT_TYPE_CREATE',
  // Ejemplos futuros:
  // PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  // PRODUCT_CREATE = 'PRODUCT_CREATE',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** Roles que pueden ver/resolver cada naturaleza de solicitud. */
export const REQUEST_AUDIENCE: Record<RequestType, string[]> = {
  [RequestType.PRODUCT_TYPE_CREATE]: ['admin', 'superadmin'],
};

/** Naturalezas que un usuario autenticado puede solicitar (crear). */
export const CREATABLE_REQUEST_TYPES: RequestType[] = [RequestType.PRODUCT_TYPE_CREATE];
