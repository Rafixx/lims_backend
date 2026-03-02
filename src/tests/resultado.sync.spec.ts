/**
 * Tests de sincronización de estados Resultado → Técnica → Muestra.
 *
 * Cubre:
 *   - Al crear un Resultado sobre una técnica activa, la técnica pasa a
 *     COMPLETADA_TECNICA (12) y la muestra se recalcula.
 *   - Técnicas EN_PROCESO (10), ASIGNADA (9) y CREADA (8) transicionan a 12.
 *   - Técnica ya en estado final ({12, 13, 14}): se permite resultado sin
 *     cambiar el estado de la técnica.
 *   - Prioridad de error: si hay ERROR_TECNICA (14), muestra → COMPLETADA_ERROR (7).
 *   - Regresión: iniciarTecnica (→10) no cambia el estado de la muestra.
 */
import { Muestra } from '../models/Muestra';
import { Tecnica } from '../models/Tecnica';
import { ResultadoService } from '../services/resultado.service';
import { TecnicaRepository } from '../repositories/tecnica.repository';
import { ESTADO_MUESTRA, ESTADO_TECNICA } from '../constants/estados.constants';
import * as fixtures from './utils/fixtures';

const service = new ResultadoService();
const repo = new TecnicaRepository();

describe('Sincronización Resultado → Técnica → Muestra (integración)', () => {
  let solicitudId: number;
  let procId: number;

  beforeEach(async () => {
    const base = await fixtures.crearEscenarioBase();
    solicitudId = base.solicitudId;
    procId = base.procId;
  });

  // ── Escenario 1: técnica EN_PROCESO, única técnica ──────────────────────────
  it('técnica EN_PROCESO (10) → resultado → técnica COMPLETADA_TECNICA (12), muestra COMPLETADA (4)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnica.id_tecnica,
      valor: '1.5',
    });

    const tecnicaActual = await Tecnica.findByPk(tecnica.id_tecnica);
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);

    expect(tecnicaActual?.id_estado).toBe(ESTADO_TECNICA.COMPLETADA_TECNICA); // 12
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA);         // 4
  });

  // ── Escenario 2: dos técnicas, una se completa ───────────────────────────────
  it('resultado en una de dos técnicas → muestra permanece EN_PROCESO (3)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    // técnica que queda en ASIGNADA
    await fixtures.crearTecnica(muestra.id_muestra, procId, ESTADO_TECNICA.ASIGNADA);
    // técnica que recibirá el resultado
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnicaACompletar.id_tecnica,
      valor: '2.0',
    });

    // [9, 12] → hay no-final → EN_PROCESO
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3
  });

  // ── Escenario 3: hay ERROR_TECNICA → prioridad de error ─────────────────────
  it('hay ERROR_TECNICA (14) entre técnicas → muestra COMPLETADA_ERROR (7)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    // técnica con error (ya final)
    await fixtures.crearTecnica(muestra.id_muestra, procId, ESTADO_TECNICA.ERROR_TECNICA);
    // técnica en proceso que recibe el resultado
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnicaACompletar.id_tecnica,
      valor: '0.9',
    });

    // [14, 12] → ERROR → COMPLETADA_ERROR
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA_ERROR); // 7
  });

  // ── Escenario 4: CANCELADA (13) + EN_PROCESO → todas finales → COMPLETADA ──
  it('CANCELADA_TECNICA (13) + EN_PROCESO → resultado → muestra COMPLETADA (4)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    // técnica cancelada
    await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.CANCELADA_TECNICA
    );
    // técnica que recibe el resultado
    const tecnicaACompletar = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.EN_PROCESO
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnicaACompletar.id_tecnica,
      valor: '3.1',
    });

    // [13, 12] → todas finales sin error → COMPLETADA
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA); // 4
  });

  // ── Escenario 5: técnica ASIGNADA (9) ───────────────────────────────────────
  it('técnica ASIGNADA (9) → resultado → técnica COMPLETADA_TECNICA (12)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ASIGNADA
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnica.id_tecnica,
      valor: '4.2',
    });

    const tecnicaActual = await Tecnica.findByPk(tecnica.id_tecnica);
    expect(tecnicaActual?.id_estado).toBe(ESTADO_TECNICA.COMPLETADA_TECNICA); // 12
  });

  // ── Escenario 6: técnica CREADA (8) ─────────────────────────────────────────
  it('técnica CREADA (8) → resultado → técnica COMPLETADA_TECNICA (12)', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.CREADA
    );

    await service.createResultado({
      id_muestra: muestra.id_muestra,
      id_tecnica: tecnica.id_tecnica,
      valor: '5.0',
    });

    const tecnicaActual = await Tecnica.findByPk(tecnica.id_tecnica);
    expect(tecnicaActual?.id_estado).toBe(ESTADO_TECNICA.COMPLETADA_TECNICA); // 12
  });

  // ── Escenario 7: técnica ya COMPLETADA_TECNICA (12) → segundo resultado OK ──
  it('técnica ya COMPLETADA_TECNICA (12) → segundo resultado permitido sin cambio de estado', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.COMPLETADA);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.COMPLETADA_TECNICA
    );

    // Debe resolverse sin error
    await expect(
      service.createResultado({
        id_muestra: muestra.id_muestra,
        id_tecnica: tecnica.id_tecnica,
        valor: '6.0',
      })
    ).resolves.toBeDefined();

    // Estado no cambia
    const tecnicaActual = await Tecnica.findByPk(tecnica.id_tecnica);
    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(tecnicaActual?.id_estado).toBe(ESTADO_TECNICA.COMPLETADA_TECNICA); // 12
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.COMPLETADA);         // 4
  });

  // ── Escenario 8: técnica ERROR_TECNICA (14) → resultado permitido sin cambio ─
  it('técnica ERROR_TECNICA (14) → resultado permitido, estado técnica sin cambio', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.COMPLETADA_ERROR);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ERROR_TECNICA
    );

    await expect(
      service.createResultado({
        id_muestra: muestra.id_muestra,
        id_tecnica: tecnica.id_tecnica,
        valor: '7.0',
      })
    ).resolves.toBeDefined();

    const tecnicaActual = await Tecnica.findByPk(tecnica.id_tecnica);
    expect(tecnicaActual?.id_estado).toBe(ESTADO_TECNICA.ERROR_TECNICA); // 14, sin cambio
  });

  // ── Escenario 9 (regresión): iniciarTecnica → EN_PROCESO, muestra NO cambia ─
  it('regresión: iniciarTecnica (→10) no modifica el estado de la muestra', async () => {
    const muestra = await fixtures.crearMuestra(solicitudId, ESTADO_MUESTRA.EN_PROCESO);
    const tecnica = await fixtures.crearTecnica(
      muestra.id_muestra,
      procId,
      ESTADO_TECNICA.ASIGNADA
    );

    await repo.iniciarTecnica(tecnica.id_tecnica);

    const muestraActual = await Muestra.findByPk(muestra.id_muestra);
    expect(muestraActual?.id_estado).toBe(ESTADO_MUESTRA.EN_PROCESO); // 3, sin cambio
  });
});
