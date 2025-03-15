// src/controllers/solicitudes.controller.ts
import { Request, Response } from 'express';
import { solicitudes } from '../data/solicitudes';
import { Solicitud } from '../data/tipos';

// Obtener todos las solicitudes
export const getSolicitudes = (req: Request, res: Response): void => {
  res.json(solicitudes);
};

// Obtener una solicitud por su id
export const getSolicitudById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const solicitud = solicitudes.find((p) => p.id === id);
  if (!solicitud) {
    res.status(404).json({ message: 'Solicitud no encontrada' });
    return;
  }
  res.json(solicitud);
};

// Crear un nueva solicitud
export const createSolicitud = (req: Request, res: Response): void => {
  // Se espera que el body contenga "fechaSolicitud", "solicitante" y "muestras" (array de IDs de muestras)
  const newSolicitud: Solicitud = {
    id: `SOL${solicitudes.length + 1}`,
    ...req.body,
  };
  solicitudes.push(newSolicitud);
  res.status(201).json(newSolicitud);
};

// Actualizar una solicitud existente
export const updateSolicitud = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = solicitudes.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Solicitud no encontrada' });
    return;
  }
  const updatedSolicitud = {
    ...solicitudes[index],
    ...req.body,
  };
  solicitudes[index] = updatedSolicitud;
  res.json(updatedSolicitud);
};

// Eliminar una solicitud
export const deleteSolicitud = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = solicitudes.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Solicitud no encontrada' });
    return;
  }
  solicitudes.splice(index, 1);
  res.status(204).send();
};
