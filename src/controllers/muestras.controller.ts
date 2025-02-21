// src/controllers/muestras.controller.ts
import { Request, Response } from 'express';
// import { muestras } from '../data/muestras';
import { muestras } from '../data/generaMuestras';
import { Muestra } from '../data/tipos';
import { getIO } from '../socket';

// Obtener todas las muestras
export const getMuestras = (req: Request, res: Response): void => {
  res.json(muestras);
};

// Obtener una muestra por id
export const getMuestraById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const muestra = muestras.find((m) => m.id === id);
  if (!muestra) {
    res.status(404).json({ message: 'Muestra no encontrada' });
    return;
  }
  res.json(muestra);
};

// Crear una nueva muestra
export const createMuestra = (req: Request, res: Response): void => {
  const newMuestra: Muestra = {
    id: `muestra${muestras.length + 1}`,
    ...req.body, // Se espera que el body contenga identificacionExterna, codigoInterno, fechaIngreso, estado, ubicacion y productos
  };
  muestras.push(newMuestra);
  res.status(201).json(newMuestra);
};

// Actualizar una muestra existente
export const updateMuestra = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = muestras.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Muestra no encontrada' });
    return;
  }
  const updatedMuestra = {
    ...muestras[index],
    ...req.body,
  };
  muestras[index] = updatedMuestra;
  res.json(updatedMuestra);
};

// Eliminar una muestra
export const deleteMuestra = (req: Request, res: Response): void => {
  const { id } = req.params;
  const index = muestras.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Muestra no encontrada' });
    return;
  }
  muestras.splice(index, 1);
  res.status(204).send();
};

// Función para actualizar el estado de una muestra
export const updateMuestraEstado = (req: Request, res: Response): void => {
  const { id } = req.params;
  const muestra = muestras.find((m) => m.id === id);
  if (!muestra) {
    res.status(404).json({ message: 'Muestra no encontrada' });
    return;
  }

  // Alterna el estado: de "Pendiente" a "Actualizado" y viceversa.
  muestra.estado = muestra.estado === 'Pendiente' ? 'Actualizado' : 'Pendiente';

  // Emite el evento de socket para notificar a los clientes
  getIO().emit('muestra_actualizada', muestra);

  res.json(muestra);
};
