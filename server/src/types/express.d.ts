declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      role: 'DONOR' | 'CREATOR' | 'ADMIN'
    }
  }
}

export {}
