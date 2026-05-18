import bcrypt from 'bcryptjs';

export const AuthService = {
  // Transforma senha em Hash (usado no Registro)
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  // Compara senha digitada com o Hash do banco (usado no Login)
  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
};