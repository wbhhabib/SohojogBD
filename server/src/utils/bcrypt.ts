import bcrypt from 'bcryptjs'

export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12)
}

export const comparePassword = (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed)
}