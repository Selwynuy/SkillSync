import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
  }

  interface Session {
    user: User & {
      id: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
  }
}
