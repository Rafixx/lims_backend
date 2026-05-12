import { Request, Response, NextFunction } from 'express'
import { RegistroMasivoService, RegistroMasivoRequest } from '../services/registroMasivo.service'
import { BadRequestError } from '../errors/BadRequestError'

const registroMasivoService = new RegistroMasivoService()

export const crearRegistroMasivo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<RegistroMasivoRequest>

    // Validate required fields
    const missingFields: string[] = []

    if (body.estudio === undefined || body.estudio === '') missingFields.push('estudio')
    if (body.id_prueba === undefined) missingFields.push('id_prueba')
    if (body.id_tipo_muestra === undefined) missingFields.push('id_tipo_muestra')
    if (body.id_cliente === undefined) missingFields.push('id_cliente')
    if (body.total_muestras === undefined) missingFields.push('total_muestras')
    if (body.plate_config === undefined) missingFields.push('plate_config')
    if (!body.f_recepcion || String(body.f_recepcion).trim() === '') missingFields.push('f_recepcion')

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Campos obligatorios faltantes: ${missingFields.join(', ')}`,
      })
      return
    }

    const { plate_config } = body

    if (!plate_config || plate_config.width === undefined) {
      res.status(400).json({ error: 'plate_config.width es obligatorio' })
      return
    }
    if (!plate_config.heightLetter) {
      res.status(400).json({ error: 'plate_config.heightLetter es obligatorio' })
      return
    }
    if (!plate_config.code_prefix) {
      res.status(400).json({ error: 'plate_config.code_prefix es obligatorio' })
      return
    }

    const total_muestras = Number(body.total_muestras)
    if (!Number.isInteger(total_muestras) || total_muestras < 1 || total_muestras > 9999) {
      res.status(400).json({
        error: 'total_muestras debe ser un número entero entre 1 y 9999',
      })
      return
    }

    const request: RegistroMasivoRequest = {
      estudio: String(body.estudio),
      id_prueba: Number(body.id_prueba),
      id_tipo_muestra: Number(body.id_tipo_muestra),
      id_cliente: Number(body.id_cliente),
      total_muestras,
      plate_config: {
        width: Number(plate_config.width),
        heightLetter: String(plate_config.heightLetter),
        code_prefix: String(plate_config.code_prefix),
      },
      f_recepcion: String(body.f_recepcion),
      codigo_externo_placa:
        body.codigo_externo_placa && String(body.codigo_externo_placa).trim() !== ''
          ? String(body.codigo_externo_placa)
          : undefined,
      id_paciente: body.id_paciente !== undefined ? Number(body.id_paciente) : undefined,
      id_centro: body.id_centro !== undefined ? Number(body.id_centro) : undefined,
      id_tecnico_resp:
        body.id_tecnico_resp !== undefined ? Number(body.id_tecnico_resp) : undefined,
      id_criterio_validacion:
        body.id_criterio_validacion !== undefined
          ? Number(body.id_criterio_validacion)
          : undefined,
      condiciones_envio: body.condiciones_envio,
      tiempo_hielo: body.tiempo_hielo,
      observaciones: body.observaciones,
    }

    const resultado = await registroMasivoService.crearRegistroMasivo(request)
    res.status(201).json(resultado)
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).json({ error: error.message })
      return
    }
    next(error)
  }
}
