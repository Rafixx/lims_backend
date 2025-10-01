import { Request, Response, NextFunction } from 'express';
import { EstadoService } from '../services/estado.service';
import { EstadoRepository } from '../repositories/estado.repository';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';

export class EstadoController {
  private estadoService: EstadoService;
  private estadoRepository: EstadoRepository;

  constructor() {
    this.estadoService = new EstadoService();
    this.estadoRepository = new EstadoRepository();
  }

  // Método auxiliar para validar y parsear IDs
  private validateId(id: string): number {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new BadRequestError(`ID inválido: "${id}". Debe ser un número.`);
    }
    return parsedId;
  }

  // GET /api/estados
  getAllEstados = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estados = await this.estadoRepository.findAll();
      res.json(estados);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/estados/:id
  getEstadoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const estadoId = this.validateId(id);

      const estado = await this.estadoRepository.findById(estadoId);

      if (!estado) {
        throw new NotFoundError(`Estado con ID ${id} no encontrado`);
      }

      res.json(estado);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/estados/entidad/:entidad
  getEstadosByEntidad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entidad } = req.params;

      if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const estados = await this.estadoService.getEstadosPorEntidad(entidad);
      res.json(estados);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/estados/entidad/:entidad/inicial
  getEstadoInicial = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entidad } = req.params;

      if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const estadoInicial =
        await this.estadoRepository.findEstadoInicial(entidad);

      if (!estadoInicial) {
        throw new NotFoundError(`Estado inicial para ${entidad} no encontrado`);
      }

      res.json(estadoInicial);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/estados/entidad/:entidad/finales
  getEstadosFinales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entidad } = req.params;

      if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const estadosFinales =
        await this.estadoRepository.findEstadosFinales(entidad);
      res.json(estadosFinales);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/estados/entidad/:entidad/disponibles/:estadoActualId?
  getEstadosDisponibles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entidad, estadoActualId } = req.params;

      if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const estadoId = estadoActualId ? parseInt(estadoActualId) : undefined;
      const estadosDisponibles =
        await this.estadoRepository.getEstadosDisponibles(entidad, estadoId);

      res.json(estadosDisponibles);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/estados/validar-transicion
  validarTransicion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entidad, estadoOrigenId, estadoDestinoId } = req.body;

      if (!entidad || !estadoOrigenId || !estadoDestinoId) {
        throw new BadRequestError(
          'Faltan parámetros requeridos: entidad, estadoOrigenId, estadoDestinoId'
        );
      }

      if (entidad !== 'MUESTRA' && entidad !== 'TECNICA') {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const esValida = await this.estadoService.validarTransicion(
        entidad,
        estadoOrigenId,
        estadoDestinoId
      );

      res.json({ valida: esValida });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/estados/cambiar/muestra/:muestraId
  cambiarEstadoMuestra = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { muestraId } = req.params;
      const { nuevoEstadoId, observaciones } = req.body;

      if (!nuevoEstadoId) {
        throw new BadRequestError('Se requiere nuevoEstadoId');
      }

      const resultado = await this.estadoService.cambiarEstadoMuestra(
        parseInt(muestraId),
        nuevoEstadoId,
        observaciones
      );

      res.json({
        success: true,
        message: 'Estado de muestra actualizado correctamente',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/estados/cambiar/tecnica/:tecnicaId
  cambiarEstadoTecnica = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tecnicaId } = req.params;
      const { nuevoEstadoId, observaciones } = req.body;

      if (!nuevoEstadoId) {
        throw new BadRequestError('Se requiere nuevoEstadoId');
      }

      const resultado = await this.estadoService.cambiarEstadoTecnica(
        parseInt(tecnicaId),
        nuevoEstadoId,
        observaciones
      );

      res.json({
        success: true,
        message: 'Estado de técnica actualizado correctamente',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/estados
  createEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estadoData = req.body;

      // Validaciones básicas
      if (!estadoData.entidad || !estadoData.estado) {
        throw new BadRequestError('Faltan campos requeridos: entidad, estado');
      }

      if (
        estadoData.entidad !== 'MUESTRA' &&
        estadoData.entidad !== 'TECNICA'
      ) {
        throw new BadRequestError('Entidad debe ser MUESTRA o TECNICA');
      }

      const nuevoEstado = await this.estadoRepository.create(estadoData);
      res.status(201).json(nuevoEstado);
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/estados/:id
  updateEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const estadoData = req.body;
      const estadoId = this.validateId(id);

      const estado = await this.estadoRepository.findById(estadoId);
      if (!estado) {
        throw new NotFoundError(`Estado con ID ${id} no encontrado`);
      }

      const estadoActualizado = await this.estadoRepository.update(
        estado,
        estadoData
      );
      res.json(estadoActualizado);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/estados/:id
  deleteEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const estadoId = this.validateId(id);

      const estado = await this.estadoRepository.findById(estadoId);
      if (!estado) {
        throw new NotFoundError(`Estado con ID ${id} no encontrado`);
      }

      await this.estadoRepository.delete(estado);
      res.json({ message: 'Estado desactivado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/estados/:id/activate
  activateEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const estadoId = this.validateId(id);

      const estado = await this.estadoRepository.findById(estadoId);
      if (!estado) {
        throw new NotFoundError(`Estado con ID ${id} no encontrado`);
      }

      await this.estadoRepository.activate(estado);
      res.json({ message: 'Estado activado correctamente' });
    } catch (error) {
      next(error);
    }
  };
}
