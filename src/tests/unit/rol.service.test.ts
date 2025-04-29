import { RolService } from '../../services/rol.service';
import { RolRepository } from '../../repositories/rol.repository';
import { createMockRol } from '../utils/mockFactories';

describe('RolService - Unit Tests', () => {
  let mockRepo: jest.Mocked<RolRepository>;
  let rolService: RolService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<RolRepository>;

    rolService = new RolService(mockRepo);
  });

  describe('createRol', () => {
    it('debería crear un rol correctamente', async () => {
      const mockRol = createMockRol();
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
      const mockRol = createMockRol({ id_rol: 2 });
      mockRepo.findById.mockResolvedValue(mockRol);

      const result = await rolService.getRolById(2);
      expect(result).toEqual(mockRol);
    });

    it('debería lanzar error si no se encuentra el rol', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(rolService.getRolById(999)).rejects.toThrow(
        'Rol no encontrado'
      );
    });
  });
});
