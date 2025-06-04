import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient | undefined
}

// 热重载保护：开发环境复用实例
const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development')
    globalThis.prisma = prisma

export default prisma