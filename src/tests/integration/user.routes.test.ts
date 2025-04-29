import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/db.config';
import { Usuario } from '../../models/Usuario';
import { Rol } from '../../models/Rol';

describe('User Routes - Integration', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Limpia y crea la DB temporal

    // Insertamos el rol necesario (admin en este caso)
    await Rol.create({
      name: 'admin',
      management_users: true,
      read_only: false,
      export: true,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /usuarios', () => {
    it('debería crear un nuevo usuario', async () => {
      const newUser = {
        nombre: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: '1234',
        id_rol: 1,
      };

      const response = await request(app).post('/api/usuarios').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_usuario');
      expect(response.body.email).toBe(newUser.email);

      // Verifica en DB
      const userInDb = await Usuario.findOne({
        where: { email: newUser.email },
      });
      expect(userInDb).not.toBeNull();
    });

    it('debería devolver error si el email ya existe', async () => {
      const user = {
        nombre: 'Duplicate',
        username: 'dupeuser',
        email: 'test@example.com',
        password: '1234',
        id_rol: 1,
      };

      // Crear usuario por primera vez
      await request(app).post('/api/usuarios').send(user);

      // Intentar duplicar
      const response = await request(app).post('/api/usuarios').send(user);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email ya está en uso/i);
    });
  });
});
