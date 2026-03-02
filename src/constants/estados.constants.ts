/**
 * Constantes de IDs de estados de la tabla dim_estados
 * Estos IDs corresponden a los registros reales de dim_estados en producción.
 */

// ============ ESTADOS DE SOLICITUD ============
export const ESTADO_SOLICITUD = {
  REGISTRADA: 1,
  EN_REVISION: 2,
  APROBADA: 3,
  RECHAZADA: 4,
  EN_PROCESO: 5,
  COMPLETADA_SOLICITUD: 6,
  CANCELADA_SOLICITUD: 7,
} as const;

// ============ ESTADOS DE TÉCNICA ============
export const ESTADO_TECNICA = {
  CREADA: 8,             // estado inicial
  ASIGNADA: 9,
  EN_PROCESO: 10,
  EN_REVISION: 11,       // no-final; tratar igual que no-final
  COMPLETADA_TECNICA: 12, // final OK
  CANCELADA_TECNICA: 13, // final cancel
  ERROR_TECNICA: 14,     // final error
  REINTENTANDO: 15,      // no-final
  EXTERNALIZADA: 16,     // no-final
  ENVIADA_EXT: 17,       // no-final
  RECIBIDA_EXT: 18,      // no-final
} as const;

// ============ ESTADOS DE MUESTRA ============
export const ESTADO_MUESTRA = {
  REGISTRADA: 1,
  EN_PROCESO: 3,
  COMPLETADA: 4,
  COMPLETADA_ERROR: 7,
} as const;

// Tipos para TypeScript
export type EstadoSolicitudId =
  (typeof ESTADO_SOLICITUD)[keyof typeof ESTADO_SOLICITUD];
export type EstadoTecnicaId =
  (typeof ESTADO_TECNICA)[keyof typeof ESTADO_TECNICA];
export type EstadoMuestraId =
  (typeof ESTADO_MUESTRA)[keyof typeof ESTADO_MUESTRA];
