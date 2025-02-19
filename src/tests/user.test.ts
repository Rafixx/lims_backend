// src/tests/user.test.ts
import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/user.routes';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API Endpoints', () => {
  // Prueba GET /api/users
  it('should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Prueba GET /api/users/:id
  it('should return a single user by id', async () => {
    // Se asume que ya existe un usuario con id 'user1' en tu "base de datos" in-memory
    const res = await request(app).get('/api/users/user1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'user1');
  });

  // Prueba POST /api/users para crear un usuario
  it('should create a new user', async () => {
    const newUser = {
      nombre: 'Test User',
      email: 'test@example.com',
      rol: 'Analista',
      fechaCreacion: new Date().toISOString(),
    };

    const res = await request(app).post('/api/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(newUser.nombre);
  });

  // Prueba PUT /api/users/:id para actualizar un usuario
  it('should update an existing user', async () => {
    // Primero, crea un usuario para actualizar
    const newUser = {
      nombre: 'Update Test',
      email: 'update@test.com',
      rol: 'Lector',
      fechaCreacion: new Date().toISOString(),
    };

    const createRes = await request(app).post('/api/users').send(newUser);
    const createdUser = createRes.body;

    // Ahora actualiza el usuario
    const updatedData = { nombre: 'Updated User' };
    const updateRes = await request(app)
      .put(`/api/users/${createdUser.id}`)
      .send(updatedData);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.nombre).toBe(updatedData.nombre);
  });

  // Prueba DELETE /api/users/:id para eliminar un usuario
  it('should delete an existing user', async () => {
    // Primero, crea un usuario para eliminar
    const newUser = {
      nombre: 'Delete Test',
      email: 'delete@test.com',
      rol: 'Lector',
      fechaCreacion: new Date().toISOString(),
    };

    const createRes = await request(app).post('/api/users').send(newUser);
    const userId = createRes.body.id;

    // Elimina el usuario
    const deleteRes = await request(app).delete(`/api/users/${userId}`);
    expect(deleteRes.status).toBe(204);

    // Comprueba que ya no existe
    const getRes = await request(app).get(`/api/users/${userId}`);
    expect(getRes.status).toBe(404);
  });
});
