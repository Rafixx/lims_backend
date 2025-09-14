"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rol_service_1 = require("../../services/rol.service");
const mockFactories_1 = require("../utils/mockFactories");
describe('RolService - Unit Tests', () => {
    let mockRepo;
    let rolService;
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        rolService = new rol_service_1.RolService(mockRepo);
    });
    describe('createRol', () => {
        it('debería crear un rol correctamente', async () => {
            const mockRol = (0, mockFactories_1.createMockRol)();
            mockRepo.create.mockResolvedValue(mockRol);
            const result = await rolService.createRol({
                name: mockRol.name,
                management_users: mockRol.management_users,
                read_only: mockRol.read_only,
                export: mockRol.export,
            });
            expect(result).toEqual(mockRol);
            expect(mockRepo.create).toHaveBeenCalled();
        });
    });
    describe('getRolById', () => {
        it('debería devolver el rol si existe', async () => {
            const mockRol = (0, mockFactories_1.createMockRol)({ id_rol: 2 });
            mockRepo.findById.mockResolvedValue(mockRol);
            const result = await rolService.getRolById(2);
            expect(result).toEqual(mockRol);
        });
        it('debería lanzar error si no se encuentra el rol', async () => {
            mockRepo.findById.mockResolvedValue(null);
            await expect(rolService.getRolById(999)).rejects.toThrow('Rol no encontrado');
        });
    });
});
