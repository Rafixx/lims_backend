import { UsuarioService } from '../../services/usuario.service';
import { UsuarioRepository } from '../../repositories/usuario.repository';
import { createMockUsuario } from '../utils/mockFactories';

describe('UsuarioService - Unit Tests', () => {
  let mockRepo: jest.Mocked<UsuarioRepository>;
  let usuarioService: UsuarioService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    usuarioService = new UsuarioService(mockRepo);
  });

  describe('createUsuario', () => {
    it('debería crear un usuario correctamente si no existe el email', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      const mockUsuario = createMockUsuario();

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
      mockRepo.findByEmail.mockResolvedValue(createMockUsuario());

      await expect(
        usuarioService.createUsuario({
          nombre: 'User',
          email: 'existing@example.com',
          username: 'existinguser',
          password: '1234',
          id_rol: 1,
        })
      ).rejects.toThrow('El email ya está en uso');
    });
  });

  describe('getUsuarioById', () => {
    it('debería devolver el usuario si existe', async () => {
      const mockUsuario = createMockUsuario({ id_usuario: 99 });
      mockRepo.findById.mockResolvedValue(mockUsuario);

      const result = await usuarioService.getUsuarioById(99);
      expect(result).toEqual(mockUsuario);
    });

    it('debería lanzar error si no existe el usuario', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(usuarioService.getUsuarioById(999)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });
});
