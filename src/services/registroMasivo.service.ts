import { MuestraRepository } from '../repositories/muestra.repository'
import { ContadorRepository } from '../repositories/contador.repository'
import { DimReactivoService } from './dimReactivo.service'
import { BadRequestError } from '../errors/BadRequestError'

interface PlateConfig {
  width: number
  heightLetter: string
  code_prefix: string
}

export interface RegistroMasivoRequest {
  estudio: string
  id_prueba: number
  id_tipo_muestra: number
  id_cliente: number
  total_muestras: number
  plate_config: PlateConfig
  f_recepcion: string
  codigo_externo_placa?: string
  id_paciente?: number
  id_centro?: number
  id_tecnico_resp?: number
  id_criterio_validacion?: number
  condiciones_envio?: string
  tiempo_hielo?: string
  observaciones?: string
}

export interface RegistroMasivoResult {
  placas_creadas: number
  total_posiciones: number
  total_muestras: number
  posiciones_vacias: number
  codigos_placa: string[]
  codigo_epi_placa: string
  codigos_epi_rango: { primero: string; ultimo: string }
  mensaje: string
}

function letterToNumber(letter: string): number {
  const upper = letter.toUpperCase()
  const code = upper.charCodeAt(0) - 'A'.charCodeAt(0) + 1
  if (code < 1 || code > 26) {
    throw new BadRequestError(
      `heightLetter debe ser una letra entre A y Z. Recibido: "${letter}"`
    )
  }
  return code
}

function buildPlateCode(prefix: string, plateIndex: number): string {
  return `${prefix}-P${String(plateIndex).padStart(3, '0')}`
}

export class RegistroMasivoService {
  private readonly muestraRepo: MuestraRepository
  private readonly contadorRepo: ContadorRepository

  constructor() {
    const dimReactivoService = new DimReactivoService()
    this.muestraRepo = new MuestraRepository(dimReactivoService)
    this.contadorRepo = new ContadorRepository()
  }

  private async getCodigoEpi(): Promise<{ codigo_epi: string; secuencia: number; year: number }> {
    const now = new Date()
    const currentYear = now.getFullYear()
    const { year, value } = await this.contadorRepo.getNextValue('muestra', currentYear)

    const configuredDigits = Number(process.env.CODIGO_EPI_SEQUENCE_DIGITS ?? '5')
    const digits =
      Number.isFinite(configuredDigits) && configuredDigits >= 4
        ? Math.min(configuredDigits, 8)
        : 5
    const yearPrefix = year.toString().slice(-2)
    const paddedSequence = value.toString().padStart(digits, '0')
    const codigo_epi = `${yearPrefix}.${paddedSequence}`

    return { codigo_epi, secuencia: value, year }
  }

  private async getCodigoPlaca(): Promise<string> {
    const now = new Date()
    const currentYear = now.getFullYear()
    const { year, value } = await this.contadorRepo.getNextValue('placa', currentYear)
    const yearPrefix = year.toString().slice(-2)
    const paddedSequence = value.toString().padStart(5, '0')
    return `PLC${yearPrefix}.${paddedSequence}`
  }

  async crearRegistroMasivo(req: RegistroMasivoRequest): Promise<RegistroMasivoResult> {
    const {
      estudio,
      id_prueba,
      id_tipo_muestra,
      id_cliente,
      total_muestras,
      plate_config,
      f_recepcion,
      codigo_externo_placa,
      id_paciente,
      id_centro,
      id_tecnico_resp,
      id_criterio_validacion,
      condiciones_envio,
      tiempo_hielo,
      observaciones,
    } = req

    const { width, heightLetter, code_prefix } = plate_config

    // Validate plate config
    const heightNum = letterToNumber(heightLetter)
    if (width < 1 || width > 50) {
      throw new BadRequestError('plate_config.width debe ser un número entre 1 y 50')
    }

    const posicionesPorPlaca = width * heightNum
    const numPlacas = Math.ceil(total_muestras / posicionesPorPlaca)

    const codigosPlaca: string[] = []
    let primerCodigoEpi: string | null = null
    let ultimoCodigoEpi: string | null = null
    let codigoEpiPlacaFinal: string = ''
    let totalPosicionesCreadas = 0
    let muestrasRestantes = total_muestras

    for (let plateIndex = 1; plateIndex <= numPlacas; plateIndex++) {
      const plateCode = buildPlateCode(code_prefix, plateIndex)
      codigosPlaca.push(plateCode)

      // For the last plate, only fill up to the remaining samples count.
      const posForThisPlate = Math.min(posicionesPorPlaca, muestrasRestantes)
      muestrasRestantes -= posForThisPlate

      // Calculate the effective heightLetter for this plate
      const effectiveHeightNum = Math.ceil(posForThisPlate / width)
      const effectiveHeightLetter = String.fromCharCode(
        'A'.charCodeAt(0) + effectiveHeightNum - 1
      )
      const effectiveTotalPositions = effectiveHeightNum * width

      // Get an independent PLC code for the plate parent (does NOT consume from the muestra sequence)
      const codigoPlaca = await this.getCodigoPlaca()
      if (codigoEpiPlacaFinal === '') {
        codigoEpiPlacaFinal = codigoPlaca
      }

      const muestraData = {
        estudio,
        codigo_epi: codigoPlaca,
        codigo_externo: codigo_externo_placa || undefined,
        f_recepcion,
        observaciones,
        solicitud: {
          condiciones_envio,
          tiempo_hielo,
          cliente: {
            id: id_cliente,
          },
        },
        ...(id_paciente !== undefined ? { paciente: { id: id_paciente } } : {}),
        ...(id_tecnico_resp !== undefined
          ? { tecnico_resp: { id_usuario: id_tecnico_resp } }
          : {}),
        tipo_muestra: { id: id_tipo_muestra },
        ...(id_centro !== undefined ? { centro: { id: id_centro } } : {}),
        ...(id_criterio_validacion !== undefined
          ? { criterio_validacion: { id: id_criterio_validacion } }
          : {}),
        prueba: { id: id_prueba },
        array_config: {
          code: plateCode,
          width,
          heightLetter: effectiveHeightLetter,
          height: effectiveHeightNum,
          totalPositions: effectiveTotalPositions,
        },
      }

      // Track first/last EPI code assigned to well positions (not the plate itself)
      let lastEpiInPlate: string | null = null
      const trackingGetCodigoEpi = async () => {
        const result = await this.getCodigoEpi()
        if (primerCodigoEpi === null) primerCodigoEpi = result.codigo_epi
        lastEpiInPlate = result.codigo_epi
        return result
      }

      await this.muestraRepo.create(muestraData, trackingGetCodigoEpi)

      if (lastEpiInPlate !== null) ultimoCodigoEpi = lastEpiInPlate
      totalPosicionesCreadas += effectiveTotalPositions
    }

    const posicionesVacias = totalPosicionesCreadas - total_muestras

    return {
      placas_creadas: numPlacas,
      total_posiciones: totalPosicionesCreadas,
      total_muestras,
      posiciones_vacias: posicionesVacias,
      codigos_placa: codigosPlaca,
      codigo_epi_placa: codigoEpiPlacaFinal,
      codigos_epi_rango: {
        primero: primerCodigoEpi ?? '',
        ultimo: ultimoCodigoEpi ?? '',
      },
      mensaje: `${numPlacas} placa(s) creadas con un total de ${totalPosicionesCreadas} posiciones para ${total_muestras} muestras`,
    }
  }
}
