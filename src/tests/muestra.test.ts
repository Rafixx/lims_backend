// src/tests/muestra.test.ts
import request from 'supertest';
import express from 'express';
import muestraRoutes from '../routes/muestras.routes';

const app = express();
app.use(express.json());
app.use('/api/muestras', muestraRoutes);

describe('Muestras API', () => {
  // Prueba para obtener todas las muestras
  it('should return all muestras', async () => {
    const res = await request(app).get('/api/muestras');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Prueba para crear una nueva muestra
  it('should create a new muestra', async () => {
    const newMuestra = {
      identificacionExterna: 'EXT-TEST',
      codigoInterno: 'INT-TEST',
      fechaIngreso: new Date().toISOString(),
      estado: 'Pendiente',
      ubicacion: 'Test Location',
      productos: [],
    };

    const res = await request(app).post('/api/muestras').send(newMuestra);
    expect(res.status).toBe(201);
    expect(res.body.codigoInterno).toBe(newMuestra.codigoInterno);
  });

  // Prueba para actualizar una muestra
  it('should update a muestra', async () => {
    // Primero, se crea una muestra
    const newMuestra = {
      identificacionExterna: 'EXT-UPDATE',
      codigoInterno: 'INT-UPDATE',
      fechaIngreso: new Date().toISOString(),
      estado: 'Pendiente',
      ubicacion: 'Test Update Location',
      productos: [],
    };
    const createRes = await request(app).post('/api/muestras').send(newMuestra);
    const createdMuestra = createRes.body;

    // Luego, se actualiza la muestra creada
    const updatedData = { estado: 'Actualizado' };
    const updateRes = await request(app)
      .put(`/api/muestras/${createdMuestra.id}`)
      .send(updatedData);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.estado).toBe('Actualizado');
  });

  // Prueba para eliminar una muestra
  it('should delete a muestra', async () => {
    // Primero, se crea una nueva muestra
    const newMuestra = {
      identificacionExterna: 'EXT-DELETE',
      codigoInterno: 'INT-DELETE',
      fechaIngreso: new Date().toISOString(),
      estado: 'Pendiente',
      ubicacion: 'Test Delete Location',
      productos: [],
    };
    const createRes = await request(app).post('/api/muestras').send(newMuestra);
    const id = createRes.body.id;

    // Se elimina la muestra
    const deleteRes = await request(app).delete(`/api/muestras/${id}`);
    expect(deleteRes.status).toBe(204);

    // Se verifica que la muestra ya no exista
    const getRes = await request(app).get(`/api/muestras/${id}`);
    expect(getRes.status).toBe(404);
  });
});
