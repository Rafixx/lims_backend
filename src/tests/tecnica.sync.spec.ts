/**
 * Tests de sincronización de estados Técnica ↔ Muestra.
 *
 * Cubre:
 *   - calcularEstadoMuestra (función pura)
 *   - Regla 3.1: createTecnica → técnica CREADA (8), muestra REGISTRADA (1)
 *   - Regla 3.2: técnica → ASIGNADA (9) → muestra EN_PROCESO (3)
 *   - Regla 3.3: técnica → EN_PROCESO (10) → muestra sin cambio
 *   - Regla 3.4: técnica → COMPLETADA_TECNICA (12) → recalcular muestra
 */
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { TecnicaRepository } from '../repositories/tecnica.repository';
import { TecnicaService } from '../services/tecnica.service';
import { ESTADO_MUESTRA, ESTADO_TECNICA } from '../constants/estados.constants';
import { calcularEstadoMuestra } from '../utils/estadoSync';
import * as fixtures from './utils/fixtures';

// ─────────────────────────────────────────────
// Sección 1: Función pura (sin acceso a BD)
// ─────────────────────────────────────────────
describe('calcularEstadoMuestra (función pura)', () => {
  it('todas en COMPLETADA_TECNICA (12) → COMPLETADA (4)', () => {
    expect(calcularEstadoMuestra([12])).toBe(ESTADO_MUESTRA.COMPLETADA);
    expect(calcularEstadoMuestra([12, 12])).toBe(ESTADO_MUESTRA.COMPLETADA);
  });

  it('mezcla COMPLETADA (12) + CANCELADA (13) sin error → COMPLETADA (4)', () => {
    expect(calcularEstadoMuestra([12, 13])).toBe(ESTADO_MUESTRA.COMPLETADA);
  });

  it('mezcla COMPLETADA (12) + ASIGNADA (9) → EN_PROCESO (3)', () => {
    expect(calcularEstadoMuestra([12, 9])).toBe(ESTADO_MUESTRA.EN_PROCESO);
  });

  it('cualquier ERROR_TECNICA (14) → COMPLETADA_ERROR (7), tiene prioridad sobre regla B', () => {
    expect(calcularEstadoMuestra([14])).toBe(ESTADO_MUESTRA.COMPLETADA_ERROR);
    expect(calcularEstadoMuestra([14, 12])).toBe(ESTADO_MUESTRA.COMPLETADA_ERROR);
    expect(calcularEstadoMuestra([14, 13])).toBe(ESTADO_MUESTRA.COMPLETADA_ERROR);
  });

  it('mezcla CANCELADA (13) + ASIGNADA (9) sin error → EN_PROCESO (3)', () => {
    expect(calcularEstadoMuestra([13, 9])).toBe(ESTADO_MUESTRA.EN_PROCESO);
  });

  it('estados no-finales (15 REINTENTANDO, 16 EXTERNALIZADA…) → EN_PROCESO (3)', () => {
    expect(calcularEstadoMuestra([15])).toBe(ESTADO_MUESTRA.EN_PROCESO);
    expect(calcularEstadoMuestra([16, 12])).toBe(ESTADO_MUESTRA.EN_PROCESO);
    expect(calcularEstadoMuestra([17])).toBe(ESTADO_MUESTRA.EN_PROCESO);
  });

  it('array vacío → EN_PROCESO (3) por defecto', () => {
    expect(calcularEstadoMuestra([])).toBe(ESTADO_MUESTRA.EN_PROCESO);
  });
});

// ─────────────────────────────────────────────
// Sección 2: Integración con SQLite in-memory
// ─────────────────────────────────────────────
describe('Sincronización Técnica ↔ Muestra (integración)', () => {
  const repo = new TecnicaRepository();
  let solicitudId: number;
  let procId: number;

  beforeEach(async () => {
    const base = await fixtures.crearEscenarioBase();
    solicitudId = base.solicitudId;
    procId = base.procId;
  });

  // ── Regla 3.1 ──────────────────────────────────────────────────────────────
  it('regla 3.1 – createTecnica: técnica CREADA (8), muestra forzada a REGISTRADA (1)', async () => {
    // Muestra ya en EN_PROCESO para verificar que se "retrocede" a REGISTRADA
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );

    const service = new TecnicaService();
    await service.createTecnica({
      id_muestra: muestra.id_muestra,
      id_tecnica_proc: procId,
    });

    const tecnica = await Tecnica.findOne({
      where: { id_muestra: muestra.id_muestra },
    });
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);

    expect(tecnica?.id_estado).toBe(ESTADO_TECNICA.CREADA);        // 8
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.REGISTRADA); // 1
  });

  // ── Regla 3.2 ──────────────────────────────────────────────────────────────
  it('regla 3.2 – técnica → ASIGNADA (9): muestra pasa a EN_PROCESO (3)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.REGISTRADA
    );
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.CREADA
    );

    await repo.asignarTecnica(tecnica.id_tecnica);

    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3
  });

  // ── Regla 3.3 ──────────────────────────────────────────────────────────────
  it('regla 3.3 – técnica → EN_PROCESO (10): muestra NO cambia', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ASIGNADA
    );

    await repo.iniciarTecnica(tecnica.id_tecnica);

    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3, sin cambio
  });

  // ── Regla 3.4 – escenario A: todas completadas ─────────────────────────────
  it('regla 3.4 – todas las técnicas COMPLETADA_TECNICA (12) → muestra COMPLETADA (4)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await repo.completarTecnica(tecnica.id_tecnica);

    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA); // 4
  });

  // ── Regla 3.4 – escenario B: mezcla 12 + 9 ────────────────────────────────
  it('regla 3.4 – mezcla COMPLETADA (12) + ASIGNADA (9) → muestra EN_PROCESO (3)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    // Técnica que queda en ASIGNADA
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ASIGNADA
    );
    // Técnica que se completa
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await repo.completarTecnica(tecnicaACompletar.id_tecnica);

    // [9, 12] → hay no-final → EN_PROCESO
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3
  });

  // ── Regla 3.4 – escenario C: hay ERROR_TECNICA ────────────────────────────
  it('regla 3.4 – hay ERROR_TECNICA (14) → muestra COMPLETADA_ERROR (7)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    // Técnica con error
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ERROR_TECNICA
    );
    // Técnica que se completa normalmente
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await repo.completarTecnica(tecnicaACompletar.id_tecnica);

    // [14, 12] → hay ERROR → COMPLETADA_ERROR
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA_ERROR); // 7
  });

  // ── Regla 3.4 – escenario D: 12 + 13 sin error ───────────────────────────
  it('regla 3.4 – mezcla COMPLETADA (12) + CANCELADA (13) → muestra COMPLETADA (4)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    // Técnica cancelada
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.CANCELADA_TECNICA
    );
    // Técnica que se completa
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await repo.completarTecnica(tecnicaACompletar.id_tecnica);

    // [13, 12] → todas finales sin error → COMPLETADA
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA); // 4
  });

  // ── Regla 3.4 – escenario E: 13 + 9 (recalculado al completar una 3.ª) ───
  it('regla 3.4 – mezcla CANCELADA (13) + ASIGNADA (9) → muestra EN_PROCESO (3)', async () => {
    const muestra = await fixtures.crearMuestra(
      solicitudId,
      ESTADO_MUESTRA.EN_PROCESO
    );
    // Técnica cancelada
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.CANCELADA_TECNICA
    );
    // Técnica asignada (no-final)
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ASIGNADA
    );
    // Técnica que se completa (dispara el recálculo)
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await repo.completarTecnica(tecnicaACompletar.id_tecnica);

    // [13, 9, 12] → 9 es no-final → EN_PROCESO
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3
  });
});
