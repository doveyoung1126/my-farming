// jest.config.js
const nextJest = require('next/jest')

// 提供 Next.js 应用的路径，以便在测试环境中加载 next.config.js 和 .env 文件
const createJestConfig = nextJest({ dir: './' })

// 传递给 Jest 的任何自定义配置
const customJestConfig = {
  // 如果使用 TypeScript 并且 tsconfig.json 中设置了 baseUrl，则需要以下配置来解析别名
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  // 可选：在每个测试运行前执行一些代码
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

// 导出 createJestConfig 以确保 next/jest 可以加载 Next.js 的异步配置
module.exports = createJestConfig(customJestConfig)
