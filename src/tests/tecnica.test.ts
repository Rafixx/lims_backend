// src/tests/tecnica.test.ts
import request from 'supertest';
import express from 'express';
import tecnicaRoutes from '../routes/tecnica.routes';

const app = express();
app.use(express.json());
app.use('/api/tecnicas', tecnicaRoutes);

describe('Tecnica API Endpoints', () => {
  // GET /api/tecnicas
  it('should return all tecnicas', async () => {
    const res = await request(app).get('/api/tecnicas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // GET /api/tecnicas/:id
  it('should return a single tecnica by id', async () => {
    // Se asume que ya existe una técnica con id 'tec1' en la base de datos in-memory
    const res = await request(app).get('/api/tecnicas/tec1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'tec1');
  });

  // POST /api/tecnicas
  it('should create a new tecnica', async () => {
    const newTecnica = {
      nombre: 'Nueva Técnica de Test',
      productoId: 'prod1',
      maquinaId: 'maq1',
      parametros: { volumen: '100µL' },
    };

    const res = await request(app).post('/api/tecnicas').send(newTecnica);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(newTecnica.nombre);
  });

  // PUT /api/tecnicas/:id
  it('should update an existing tecnica', async () => {
    // Primero, crea una técnica para actualizar
    const newTecnica = {
      nombre: 'Técnica a actualizar',
      productoId: 'prod1',
      maquinaId: 'maq1',
      parametros: { volumen: '50µL' },
    };
    const createRes = await request(app).post('/api/tecnicas').send(newTecnica);
    const createdTecnica = createRes.body;

    // Ahora actualiza la técnica
    const updatedData = { nombre: 'Técnica Actualizada' };
    const updateRes = await request(app)
      .put(`/api/tecnicas/${createdTecnica.id}`)
      .send(updatedData);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.nombre).toBe(updatedData.nombre);
  });

  // DELETE /api/tecnicas/:id
  it('should delete an existing tecnica', async () => {
    // Primero, crea una técnica para eliminar
    const newTecnica = {
      nombre: 'Técnica a eliminar',
      productoId: 'prod1',
      maquinaId: 'maq1',
      parametros: { volumen: '50µL' },
    };
    const createRes = await request(app).post('/api/tecnicas').send(newTecnica);
    const tecnicaId = createRes.body.id;

    // Elimina la técnica
    const deleteRes = await request(app).delete(`/api/tecnicas/${tecnicaId}`);
    expect(deleteRes.status).toBe(204);

    // Verifica que la técnica ya no exista
    const getRes = await request(app).get(`/api/tecnicas/${tecnicaId}`);
    expect(getRes.status).toBe(404);
  });
});
