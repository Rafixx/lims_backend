import { SolicitudService } from '../../services/solicitud.service';
import { SolicitudRepository } from '../../repositories/solicitud.repository';
import { createMockSolicitud } from '../utils/mockFactories';

describe('SolicitudService - Unit Tests', () => {
  let mockRepo: jest.Mocked<SolicitudRepository>;
  let solicitudService: SolicitudService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<SolicitudRepository>;

    solicitudService = new SolicitudService(mockRepo);
  });

  describe('createSolicitud', () => {
    it('debería crear una solicitud correctamente', async () => {
      const mockSolicitud = createMockSolicitud();
      mockRepo.create.mockResolvedValue(mockSolicitud);

      const result = await solicitudService.createSolicitud({
        num_solicitud: 'REQ-001',
        id_cliente: 1,
        id_prueba: 1,
        f_entrada: new Date(),
        estado_solicitud: 'EN_PROCESO',
      });

      expect(result).toEqual(mockSolicitud);
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('getSolicitudById', () => {
    it('debería devolver la solicitud si existe', async () => {
      const mockSolicitud = createMockSolicitud({ id_solicitud: 42 });
      mockRepo.findById.mockResolvedValue(mockSolicitud);

      const result = await solicitudService.getSolicitudById(42);
      expect(result).toEqual(mockSolicitud);
    });

    it('debería lanzar error si no existe la solicitud', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(solicitudService.getSolicitudById(999)).rejects.toThrow(
        'Solicitud no encontrada'
      );
    });
  });
});
