import { MuestraService } from '../../services/muestra.service';
import { MuestraRepository } from '../../repositories/muestra.repository';
import { createMockMuestra } from '../utils/mockFactories';

describe('MuestraService - Unit Tests', () => {
  let mockRepo: jest.Mocked<MuestraRepository>;
  let muestraService: MuestraService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<MuestraRepository>;

    muestraService = new MuestraService(mockRepo);
  });

  describe('createMuestra', () => {
    it('debería crear una muestra correctamente', async () => {
      const mockMuestra = createMockMuestra();
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
      const mockMuestra = createMockMuestra({ id_muestra: 100 });
      mockRepo.findById.mockResolvedValue(mockMuestra);

      const result = await muestraService.getMuestraById(100);
      expect(result).toEqual(mockMuestra);
    });

    it('debería lanzar error si la muestra no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(muestraService.getMuestraById(999)).rejects.toThrow(
        'Muestra no encontrada'
      );
    });
  });
});
