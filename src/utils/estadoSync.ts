import { ESTADO_TECNICA, ESTADO_MUESTRA } from '../constants/estados.constants';

/**
 * Estados finales "cerrados" de una técnica (sin error).
 * Una técnica en cualquiera de estos estados se considera terminada sin error.
 */
const ESTADOS_FINALES_SIN_ERROR: readonly number[] = [
  ESTADO_TECNICA.COMPLETADA_TECNICA, // 12
  ESTADO_TECNICA.CANCELADA_TECNICA,  // 13
];

/**
 * Función PURA que calcula el nuevo estado de una Muestra a partir de los
 * id_estado de todas sus Técnicas activas (no eliminadas).
 *
 * Reglas (prioridad explícita):
 *   A – Si alguna técnica está en ERROR_TECNICA (14)  → COMPLETADA_ERROR (7)
 *   B – Si todas están en final sin error (12 ó 13)   → COMPLETADA (4)
 *   C – En cualquier otro caso                         → EN_PROCESO (3)
 *
 * @param tecnicaIds - array de id_estado de las técnicas activas de la muestra
 * @returns id_estado resultante para la muestra
 */
export function calcularEstadoMuestra(tecnicaIds: number[]): number {
  if (tecnicaIds.length === 0) {
    return ESTADO_MUESTRA.EN_PROCESO;
  }

  // Regla A (máxima prioridad): cualquier ERROR → COMPLETADA_ERROR
  if (tecnicaIds.some((id) => id === ESTADO_TECNICA.ERROR_TECNICA)) {
    return ESTADO_MUESTRA.COMPLETADA_ERROR;
  }

  // Regla B: todas en estado final sin error → COMPLETADA
  if (tecnicaIds.every((id) => ESTADOS_FINALES_SIN_ERROR.includes(id))) {
    return ESTADO_MUESTRA.COMPLETADA;
  }

  // Regla C: hay técnicas no-finales (8/9/10/11/15/16/17/18 u otros) → EN_PROCESO
  return ESTADO_MUESTRA.EN_PROCESO;
}
