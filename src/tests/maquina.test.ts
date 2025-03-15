// src/tests/maquina.test.ts
import request from 'supertest';
import express from 'express';
import maquinaRoutes from '../routes/aparato.routes';

const app = express();
app.use(express.json());
app.use('/api/maquinas', maquinaRoutes);

describe('Maquina API Endpoints', () => {
  // GET /api/maquinas
  it('should return all maquinas', async () => {
    const res = await request(app).get('/api/maquinas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // GET /api/maquinas/:id
  it('should return a single maquina by id', async () => {
    // Se asume que ya existe una máquina con id 'maq1' en la base de datos in-memory
    const res = await request(app).get('/api/maquinas/maq1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'maq1');
  });

  // POST /api/maquinas
  it('should create a new maquina', async () => {
    const newMaquina = {
      nombre: 'Nuevo Termociclador',
      tipo: 'PCR',
    };
    const res = await request(app).post('/api/maquinas').send(newMaquina);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(newMaquina.nombre);
    expect(res.body.tipo).toBe(newMaquina.tipo);
  });

  // PUT /api/maquinas/:id
  it('should update an existing maquina', async () => {
    // Primero crea una máquina para actualizar
    const newMaquina = {
      nombre: 'Maquina a actualizar',
      tipo: 'qPCR',
    };
    const createRes = await request(app).post('/api/maquinas').send(newMaquina);
    const createdMaquina = createRes.body;

    // Actualiza la máquina
    const updatedData = {
      nombre: 'Maquina Actualizada',
      tipo: 'PCR Actualizada',
    };
    const updateRes = await request(app)
      .put(`/api/maquinas/${createdMaquina.id}`)
      .send(updatedData);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.nombre).toBe(updatedData.nombre);
    expect(updateRes.body.tipo).toBe(updatedData.tipo);
  });

  // DELETE /api/maquinas/:id
  it('should delete an existing maquina', async () => {
    // Crea una máquina para eliminar
    const newMaquina = {
      nombre: 'Maquina a eliminar',
      tipo: 'PCR',
    };
    const createRes = await request(app).post('/api/maquinas').send(newMaquina);
    const maquinaId = createRes.body.id;

    // Elimina la máquina
    const deleteRes = await request(app).delete(`/api/maquinas/${maquinaId}`);
    expect(deleteRes.status).toBe(204);

    // Comprueba que la máquina ya no existe
    const getRes = await request(app).get(`/api/maquinas/${maquinaId}`);
    expect(getRes.status).toBe(404);
  });
});
