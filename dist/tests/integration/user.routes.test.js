"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const db_config_1 = require("../../config/db.config");
const Usuario_1 = require("../../models/Usuario");
const Rol_1 = require("../../models/Rol");
describe('User Routes - Integration', () => {
    beforeAll(async () => {
        await db_config_1.sequelize.sync({ force: true }); // Limpia y crea la DB temporal
        // Insertamos el rol necesario (admin en este caso)
        await Rol_1.Rol.create({
            name: 'admin',
            management_users: true,
            read_only: false,
            export: true,
        });
    });
    afterAll(async () => {
        await db_config_1.sequelize.close();
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
            const response = await (0, supertest_1.default)(app_1.default).post('/api/usuarios').send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id_usuario');
            expect(response.body.email).toBe(newUser.email);
            // Verifica en DB
            const userInDb = await Usuario_1.Usuario.findOne({
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
            await (0, supertest_1.default)(app_1.default).post('/api/usuarios').send(user);
            // Intentar duplicar
            const response = await (0, supertest_1.default)(app_1.default).post('/api/usuarios').send(user);
            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/email ya está en uso/i);
        });
    });
});
