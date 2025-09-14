"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const muestra_service_1 = require("../../services/muestra.service");
const mockFactories_1 = require("../utils/mockFactories");
describe('MuestraService - Unit Tests', () => {
    let mockRepo;
    let muestraService;
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        muestraService = new muestra_service_1.MuestraService(mockRepo);
    });
    describe('createMuestra', () => {
        it('debería crear una muestra correctamente', async () => {
            const mockMuestra = (0, mockFactories_1.createMockMuestra)();
            mockRepo.create.mockResolvedValue(mockMuestra);
            const result = await muestraService.createMuestra({
                id_solicitud: 1,
                id_tipo_muestra: 1,
                codigo_epi: 'M-001',
                estado_muestra: 'CREADA',
                f_recepcion: new Date(),
            });
            expect(result).toEqual(mockMuestra);
            expect(mockRepo.create).toHaveBeenCalled();
        });
    });
    describe('getMuestraById', () => {
        it('debería devolver la muestra si existe', async () => {
            const mockMuestra = (0, mockFactories_1.createMockMuestra)({ id_muestra: 100 });
            mockRepo.findById.mockResolvedValue(mockMuestra);
            const result = await muestraService.getMuestraById(100);
            expect(result).toEqual(mockMuestra);
        });
        it('debería lanzar error si la muestra no existe', async () => {
            mockRepo.findById.mockResolvedValue(null);
            await expect(muestraService.getMuestraById(999)).rejects.toThrow('Muestra no encontrada');
        });
    });
});
