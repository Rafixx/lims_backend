// src/tests/login.test.ts
import request from 'supertest';
import { app } from '../server';

describe('POST /api/login', () => {
  test('debería devolver un token y datos del usuario para credenciales válidas', async () => {
    const validCredentials = {
      email: 'juan.perez@empresa.com',
      password: 'password', // Para la demo, se espera que la contraseña sea "password"
    };

    const res = await request(app).post('/api/login').send(validCredentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      id: 'user1',
      email: 'juan.perez@empresa.com',
      rol: 'Administrador',
    });
  });

  test('debería devolver 401 y un mensaje de error para credenciales inválidas', async () => {
    const invalidCredentials = {
      email: 'juan.perez@empresa.com',
      password: 'wrongpassword',
    };

    const res = await request(app).post('/api/login').send(invalidCredentials);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
  });
});
