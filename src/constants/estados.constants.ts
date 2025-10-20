/**
 * Constantes de IDs de estados de la tabla dim_estados
 * Estos IDs corresponden a los estados definidos en la base de datos
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

// ============ ESTADOS DE TECNICA ============
export const ESTADO_TECNICA = {
  PENDIENTE: 8,
  ASIGNADA: 9,
  EN_PROCESO: 10,
  EN_REVISION: 11,
  COMPLETADA_TECNICA: 12,
  CANCELADA_TECNICA: 13,
  PAUSADA: 14,
  REINTENTANDO: 15,
} as const;

// ============ ESTADOS DE MUESTRA ============
export const ESTADO_MUESTRA = {
  REGISTRADA_MUESTRA: 16,
  EN_ESPERA: 17,
  EN_ANALISIS: 18,
  ANALISIS_COMPLETADO: 19,
  VALIDADA: 20,
  RECHAZADA_MUESTRA: 21,
  ARCHIVADA: 22,
  DESTRUIDA: 23,
} as const;

// Tipos para TypeScript
export type EstadoSolicitudId =
  (typeof ESTADO_SOLICITUD)[keyof typeof ESTADO_SOLICITUD];
export type EstadoTecnicaId =
  (typeof ESTADO_TECNICA)[keyof typeof ESTADO_TECNICA];
export type EstadoMuestraId =
  (typeof ESTADO_MUESTRA)[keyof typeof ESTADO_MUESTRA];
