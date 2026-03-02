/**
 * Helpers para crear datos de prueba en SQLite in-memory.
 */
import { DimCliente } from '../../models/DimCliente';
import { DimTecnicaProc } from '../../models/DimTecnicaProc';
import { Muestra } from '../../models/Muestra';
import { Solicitud } from '../../models/Solicitud';
import { Tecnica } from '../../models/Tecnica';

/**
 * Crea las entidades de referencia mínimas necesarias para una prueba.
 * Devuelve los IDs para reutilizar en crearMuestra / crearTecnica.
 */
export async function crearEscenarioBase() {
  const cliente = await DimCliente.create({ nombre: 'Cliente Test' });
  const solicitud = await Solicitud.create({
    id_cliente: cliente.id,
    estado_solicitud: 'REGISTRADA',
  });
  const proc = await DimTecnicaProc.create({ tecnica_proc: 'Proc Test' });

  return {
    clienteId: cliente.id,
    solicitudId: solicitud.id_solicitud,
    procId: proc.id,
  };
}

/**
 * Crea una Muestra con el estado indicado.
 * Si no se pasa id_estado, el beforeCreate hook usará el estado inicial (1 = REGISTRADA).
 */
export async function crearMuestra(
  id_solicitud: number,
  id_estado?: number
): Promise<Muestra> {
  return Muestra.create({
    id_solicitud,
    ...(id_estado !== undefined ? { id_estado } : {}),
  });
}

/**
 * Crea una Tecnica para la muestra y proceso indicados.
 * Si no se pasa id_estado, el beforeCreate hook usará el estado inicial (8 = CREADA).
 */
export async function crearTecnica(
  id_muestra: number,
  id_tecnica_proc: number,
  id_estado?: number
): Promise<Tecnica> {
  return Tecnica.create({
    id_muestra,
    id_tecnica_proc,
    ...(id_estado !== undefined ? { id_estado } : {}),
  });
}

/**
 * Limpia las tablas transaccionales entre tests.
 * Las tablas de referencia (DimEstado) se preservan porque solo se crean en beforeAll.
 */
export async function limpiar() {
  await Tecnica.destroy({ where: {}, force: true });
  await Muestra.destroy({ where: {}, force: true });
  await Solicitud.destroy({ where: {}, force: true });
  await DimTecnicaProc.destroy({ where: {} });
  await DimCliente.destroy({ where: {} });
}
