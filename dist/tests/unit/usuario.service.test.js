"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usuario_service_1 = require("../../services/usuario.service");
const mockFactories_1 = require("../utils/mockFactories");
describe('UsuarioService - Unit Tests', () => {
    let mockRepo;
    let usuarioService;
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        usuarioService = new usuario_service_1.UsuarioService(mockRepo);
    });
    describe('createUsuario', () => {
        it('debería crear un usuario correctamente si no existe el email', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            const mockUsuario = (0, mockFactories_1.createMockUsuario)();
            mockRepo.create.mockResolvedValue(mockUsuario);
            const result = await usuarioService.createUsuario({
                nombre: mockUsuario.nombre,
                email: mockUsuario.email,
                username: mockUsuario.username,
                password: '1234',
                id_rol: mockUsuario.id_rol,
            });
            expect(result).toEqual(mockUsuario);
            expect(mockRepo.create).toHaveBeenCalled();
        });
        it('debería lanzar error si el email ya existe', async () => {
            mockRepo.findByEmail.mockResolvedValue((0, mockFactories_1.createMockUsuario)());
            await expect(usuarioService.createUsuario({
                nombre: 'User',
                email: 'existing@example.com',
                username: 'existinguser',
                password: '1234',
                id_rol: 1,
            })).rejects.toThrow('El email ya está en uso');
        });
    });
    describe('getUsuarioById', () => {
        it('debería devolver el usuario si existe', async () => {
            const mockUsuario = (0, mockFactories_1.createMockUsuario)({ id_usuario: 99 });
            mockRepo.findById.mockResolvedValue(mockUsuario);
            const result = await usuarioService.getUsuarioById(99);
            expect(result).toEqual(mockUsuario);
        });
        it('debería lanzar error si no existe el usuario', async () => {
            mockRepo.findById.mockResolvedValue(null);
            await expect(usuarioService.getUsuarioById(999)).rejects.toThrow('Usuario no encontrado');
        });
    });
});
