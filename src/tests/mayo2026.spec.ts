/**
 * Tests for LIMS Backend Changes — Mayo 2026
 *
 * Covers:
 *   1. POST /muestras/registro-masivo — f_recepcion required, codigo_externo_placa optional
 *   2. POST /muestras/registro-masivo — PLC code independent from EPI sequence
 *   3. PUT  /muestras/:id            — flat FK fields correctly mapped
 *   4. PUT  /muestras/:id/estado     — new endpoint accepts { id_estado, comentario }
 *   5. POST /muestras                — f_recepcion required validation
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { sequelize } from '../config/db.config';
import { DimCliente } from '../models/DimCliente';
import { DimPrueba } from '../models/DimPrueba';
import { DimTipoMuestra } from '../models/DimTipoMuestra';
import { DimCentro } from '../models/DimCentro';
import { DimUbicacion } from '../models/DimUbicacion';
import { DimCriterioValidacion } from '../models/DimCriterioValidacion';
import { DimTecnicaProc } from '../models/DimTecnicaProc';
import { Muestra } from '../models/Muestra';
import { Solicitud } from '../models/Solicitud';
import { ContadorRepository } from '../repositories/contador.repository';
import { RegistroMasivoService } from '../services/registroMasivo.service';
import { MuestraService } from '../services/muestra.service';

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────
const JWT_SECRET = 'test-secret-mayo2026';

function makeToken(): string {
  return jwt.sign(
    { id: 1, username: 'test', id_rol: 1, rol_name: 'admin' },
    JWT_SECRET
  );
}

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

// ─────────────────────────────────────────────
// DB seed helpers
// ─────────────────────────────────────────────
async function seedDims() {
  const cliente = await DimCliente.create({ nombre: 'Cliente Test Mayo' });
  const tipoMuestra = await DimTipoMuestra.create({ cod_tipo_muestra: 'DNA', tipo_muestra: 'DNA' });
  const centro = await DimCentro.create({ codigo: 'C01', descripcion: 'Centro Test' });
  const ubicacion = await DimUbicacion.create({ codigo: 'U01', ubicacion: 'Ubicacion Test' });
  const criterio = await DimCriterioValidacion.create({ codigo: 'CV01', descripcion: 'Criterio Test' });
  const prueba = await DimPrueba.create({ cod_prueba: 'P01', prueba: 'Prueba Test' });
  // DimTecnicaProc references DimPrueba via id_prueba; activa=true is required by getTecnicasByPrueba
  const proc = await DimTecnicaProc.create({ tecnica_proc: 'PCR Test', id_prueba: prueba.id, activa: true });

  return { cliente, tipoMuestra, centro, ubicacion, criterio, proc, prueba };
}

async function crearMuestraConSolicitud(clienteId: number): Promise<{ muestra: Muestra; solicitud: Solicitud }> {
  const solicitud = await Solicitud.create({ id_cliente: clienteId, estado_solicitud: 'REGISTRADA' });
  const muestra = await Muestra.create({ id_solicitud: solicitud.id_solicitud, id_estado: 1 });
  return { muestra, solicitud };
}

// ─────────────────────────────────────────────
// Section 1: ContadorRepository — PLC independence
// ─────────────────────────────────────────────
describe('ContadorRepository — counters are independent per key', () => {
  it('muestra and placa counters are independent sequences', async () => {
    const repo = new ContadorRepository();
    const year = new Date().getFullYear();

    const m1 = await repo.getNextValue('muestra', year);
    const m2 = await repo.getNextValue('muestra', year);
    const p1 = await repo.getNextValue('placa', year);
    const p2 = await repo.getNextValue('placa', year);
    const m3 = await repo.getNextValue('muestra', year);

    expect(m1.value).toBe(1);
    expect(m2.value).toBe(2);
    expect(p1.value).toBe(1); // placa starts at 1, not after muestra
    expect(p2.value).toBe(2);
    expect(m3.value).toBe(3); // muestra sequence not affected by placa
  });
});

// ─────────────────────────────────────────────
// Section 2: RegistroMasivo — f_recepcion validation
// ─────────────────────────────────────────────
describe('POST /api/muestras/registro-masivo — validaciones', () => {
  const token = makeToken();

  const baseBody = {
    estudio: 'ESTUDIO-TEST-2026',
    id_prueba: 99,
    id_tipo_muestra: 99,
    id_cliente: 99,
    total_muestras: 1,
    plate_config: { width: 12, heightLetter: 'H', code_prefix: 'TEST' },
    f_recepcion: '2026-05-11T10:30',
  };

  it('returns 400 when f_recepcion is missing', async () => {
    const { f_recepcion: _, ...bodyWithout } = baseBody;
    const res = await request(app)
      .post('/api/muestras/registro-masivo')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyWithout);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/f_recepcion/i);
  });

  it('returns 400 when f_recepcion is empty string', async () => {
    const res = await request(app)
      .post('/api/muestras/registro-masivo')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...baseBody, f_recepcion: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/f_recepcion/i);
  });

  it('returns 400 when other required fields are missing (smoke test)', async () => {
    const res = await request(app)
      .post('/api/muestras/registro-masivo')
      .set('Authorization', `Bearer ${token}`)
      .send({ f_recepcion: '2026-05-11T10:30' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// Section 3: RegistroMasivo — PLC code + f_recepcion + codigo_externo_placa
// Uses mocked MuestraRepository.create to avoid nested-transaction issues in SQLite
// ─────────────────────────────────────────────
describe('RegistroMasivoService — PLC code and new fields', () => {
  let createSpy: jest.SpyInstance;
  // Capture the data passed to create so we can assert on it
  let capturedMuestraData: Record<string, unknown>[] = [];

  beforeEach(() => {
    capturedMuestraData = [];
    // Mock MuestraRepository.create to avoid nested transactions in SQLite.
    // Returns a minimal fake Muestra-like object so the service can continue.
    const { MuestraRepository } = require('../repositories/muestra.repository');
    createSpy = jest.spyOn(MuestraRepository.prototype, 'create').mockImplementation(
      async (...args: unknown[]) => {
        const data = args[0] as Record<string, unknown>;
        const getCodigoEpiFn = args[1] as (() => Promise<{ codigo_epi: string }>) | undefined;
        capturedMuestraData.push(data);
        // Simulate calling getCodigoEpiFn for each well position so the service can track EPI codes
        if (getCodigoEpiFn) {
          const cfg = data.array_config as { height?: number; width?: number } | undefined;
          const positions = (cfg?.height ?? 1) * (cfg?.width ?? 1);
          for (let i = 0; i < positions; i++) await getCodigoEpiFn();
        }
        return { id_muestra: capturedMuestraData.length };
      }
    );
  });

  afterEach(() => {
    createSpy.mockRestore();
  });

  it('codigo_epi_placa uses PLC prefix, independent from EPI well sequence', async () => {
    const year = new Date().getFullYear();
    const yearSuffix = year.toString().slice(-2);

    const service = new RegistroMasivoService();
    const result = await service.crearRegistroMasivo({
      estudio: 'EST-PLC-TEST',
      id_prueba: 1,
      id_tipo_muestra: 1,
      id_cliente: 1,
      total_muestras: 2,
      plate_config: { width: 2, heightLetter: 'A', code_prefix: 'TSTPRE' },
      f_recepcion: '2026-05-11T10:30:00',
    });

    // PLC code on the plate parent
    expect(result.codigo_epi_placa).toMatch(/^PLC/);
    expect(result.codigo_epi_placa).toContain(yearSuffix);

    // EPI well codes use dot-notation (e.g. "26.00001"), NOT PLC prefix
    expect(result.codigos_epi_rango.primero).toMatch(/^\d{2}\.\d+/);
    expect(result.codigos_epi_rango.primero).not.toMatch(/^PLC/);

    // PLC code and EPI codes are different values
    expect(result.codigo_epi_placa).not.toBe(result.codigos_epi_rango.primero);
    expect(result.codigo_epi_placa).not.toBe(result.codigos_epi_rango.ultimo);

    expect(result.total_muestras).toBe(2);
    expect(result.placas_creadas).toBe(1);
  });

  it('f_recepcion is passed in the muestra data sent to create()', async () => {
    const fRecepcion = '2026-05-11T10:30:00';

    const service = new RegistroMasivoService();
    await service.crearRegistroMasivo({
      estudio: 'EST-FRECEP-TEST',
      id_prueba: 1,
      id_tipo_muestra: 1,
      id_cliente: 1,
      total_muestras: 1,
      plate_config: { width: 1, heightLetter: 'A', code_prefix: 'FRECPRE' },
      f_recepcion: fRecepcion,
    });

    expect(capturedMuestraData.length).toBe(1);
    expect(capturedMuestraData[0].f_recepcion).toBe(fRecepcion);
  });

  it('codigo_externo_placa is passed as codigo_externo on the plate data', async () => {
    const codigoExterno = 'EXT-PLACA-999';

    const service = new RegistroMasivoService();
    await service.crearRegistroMasivo({
      estudio: 'EST-EXTERNO-TEST',
      id_prueba: 1,
      id_tipo_muestra: 1,
      id_cliente: 1,
      total_muestras: 1,
      plate_config: { width: 1, heightLetter: 'A', code_prefix: 'EXTPRE' },
      f_recepcion: '2026-05-11T10:30:00',
      codigo_externo_placa: codigoExterno,
    });

    expect(capturedMuestraData.length).toBe(1);
    expect(capturedMuestraData[0].codigo_externo).toBe(codigoExterno);
  });

  it('empty codigo_externo_placa → codigo_externo is undefined in plate data', async () => {
    const service = new RegistroMasivoService();
    await service.crearRegistroMasivo({
      estudio: 'EST-NOEXT-TEST',
      id_prueba: 1,
      id_tipo_muestra: 1,
      id_cliente: 1,
      total_muestras: 1,
      plate_config: { width: 1, heightLetter: 'A', code_prefix: 'NOEXTPRE' },
      f_recepcion: '2026-05-11T10:30:00',
      codigo_externo_placa: '',
    });

    expect(capturedMuestraData.length).toBe(1);
    expect(capturedMuestraData[0].codigo_externo).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Section 4: updateMuestra — flat FK mapping
// ─────────────────────────────────────────────
describe('MuestraService.updateMuestra — flat FK field mapping', () => {
  it('maps id_tipo_muestra, id_prueba, id_centro, id_criterio_validacion, id_ubicacion as flat IDs', async () => {
    const dims = await seedDims();
    const { muestra } = await crearMuestraConSolicitud(dims.cliente.id);

    const service = new MuestraService();
    await service.updateMuestra(muestra.id_muestra, {
      id_tipo_muestra: dims.tipoMuestra.id,
      id_prueba: dims.prueba.id,
      id_centro: dims.centro.id,
      id_criterio_validacion: dims.criterio.id,
      id_ubicacion: dims.ubicacion.id,
    });

    await muestra.reload();
    expect(muestra.id_tipo_muestra).toBe(dims.tipoMuestra.id);
    expect(muestra.id_prueba).toBe(dims.prueba.id);
    expect(muestra.id_centro_externo).toBe(dims.centro.id);
    expect(muestra.id_criterio_val).toBe(dims.criterio.id);
    expect(muestra.id_ubicacion).toBe(dims.ubicacion.id);
  });

  it('maps id_solicitud_cliente to Solicitud.id_cliente', async () => {
    const dims = await seedDims();
    const cliente2 = await DimCliente.create({ nombre: 'Cliente Nuevo' });
    const { muestra, solicitud } = await crearMuestraConSolicitud(dims.cliente.id);

    const service = new MuestraService();
    await service.updateMuestra(muestra.id_muestra, {
      id_solicitud_cliente: cliente2.id,
    });

    await solicitud.reload();
    expect(solicitud.id_cliente).toBe(cliente2.id);
  });

  it('also accepts legacy nested-object format (backward compatibility)', async () => {
    const dims = await seedDims();
    const { muestra } = await crearMuestraConSolicitud(dims.cliente.id);

    const service = new MuestraService();
    await service.updateMuestra(muestra.id_muestra, {
      tipo_muestra: { id: dims.tipoMuestra.id },
      criterio_validacion: { id: dims.criterio.id },
    });

    await muestra.reload();
    expect(muestra.id_tipo_muestra).toBe(dims.tipoMuestra.id);
    expect(muestra.id_criterio_val).toBe(dims.criterio.id);
  });
});

// ─────────────────────────────────────────────
// Section 5: PUT /muestras/:id/estado
// ─────────────────────────────────────────────
describe('PUT /api/muestras/:id/estado', () => {
  const token = makeToken();

  it('returns 400 when id_estado is missing', async () => {
    const res = await request(app)
      .put('/api/muestras/1/estado')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/id_estado/i);
  });

  it('returns 400 when id_estado is invalid (zero)', async () => {
    const res = await request(app)
      .put('/api/muestras/1/estado')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_estado: 0 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when id_estado is not a number', async () => {
    const res = await request(app)
      .put('/api/muestras/1/estado')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_estado: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid muestra ID in params', async () => {
    const res = await request(app)
      .put('/api/muestras/0/estado')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_estado: 4 });

    expect(res.status).toBe(400);
  });

  it('returns 200 and updates state for valid existing muestra', async () => {
    const dims = await seedDims();
    const { muestra } = await crearMuestraConSolicitud(dims.cliente.id);

    const res = await request(app)
      .put(`/api/muestras/${muestra.id_muestra}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ id_estado: 4, comentario: 'Completado desde test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    await muestra.reload();
    expect(muestra.id_estado).toBe(4);
  });
});

// ─────────────────────────────────────────────
// Section 6: POST /muestras — f_recepcion required
// ─────────────────────────────────────────────
describe('POST /api/muestras — f_recepcion validation', () => {
  const token = makeToken();

  it('returns 400 when f_recepcion is missing from body', async () => {
    const dims = await seedDims();

    const body = {
      solicitud: {
        cliente: { id: dims.cliente.id },
      },
      tipo_muestra: { id: dims.tipoMuestra.id },
      // f_recepcion intentionally omitted
    };

    const res = await request(app)
      .post('/api/muestras')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/f_recepcion/i);
  });

  it('returns 400 when f_recepcion is empty string', async () => {
    const dims = await seedDims();

    const body = {
      solicitud: { cliente: { id: dims.cliente.id } },
      f_recepcion: '',
    };

    const res = await request(app)
      .post('/api/muestras')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/f_recepcion/i);
  });
});
