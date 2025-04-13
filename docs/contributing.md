# 贡献指南

感谢您对 ScratchMirror 项目的关注！我们非常欢迎社区成员参与贡献，无论是代码贡献、文档改进、问题报告还是功能建议。本指南将帮助您了解如何有效地参与到项目中来。

## 行为准则

参与本项目的所有贡献者都应遵循以下行为准则：

- 尊重所有项目参与者，不论其经验水平、性别、性取向、残疾状况、种族或宗教信仰
- 使用包容性语言，避免冒犯性或排他性表达
- 接受建设性批评，将重点放在改进项目上
- 在讨论中保持专业态度，避免人身攻击
- 优先考虑社区利益，而非个人利益

## 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请通过 GitHub Issues 提交。在创建新 issue 前，请先搜索现有 issues，避免重复。

创建 issue 时，请包含以下信息：

1. **对于 bug**：
   - 清晰的问题描述
   - 复现步骤
   - 预期行为与实际行为
   - 环境信息（操作系统、Node.js 版本等）
   - 相关日志或截图

2. **对于功能建议**：
   - 功能描述
   - 使用场景
   - 实现思路（如果有）

### 提交代码

1. **Fork 仓库**：
   - 访问 [https://github.com/Sunwuyuan/scratchmirror](https://github.com/Sunwuyuan/scratchmirror)
   - 点击右上角的 "Fork" 按钮创建自己的仓库副本

2. **克隆仓库**：
   ```bash
   git clone https://github.com/YOUR_USERNAME/scratchmirror.git
   cd scratchmirror
   ```

3. **创建分支**：
   ```bash
   git checkout -b feature/your-feature-name
   # 或者
   git checkout -b fix/your-bug-fix
   ```

4. **安装依赖**：
   ```bash
   npm install
   ```

5. **进行修改**：
   - 编写代码
   - 添加或更新测试
   - 更新文档（如果需要）

6. **遵循代码规范**：
   - 运行代码格式化：
     ```bash
     npm run format
     ```
   - 运行代码检查：
     ```bash
     npm run lint
     ```

7. **提交更改**：
   ```bash
   git add .
   git commit -m "描述性的提交信息"
   ```

8. **推送到 GitHub**：
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建 Pull Request**：
   - 访问您的 fork 仓库
   - 点击 "Compare & pull request"
   - 填写 PR 描述，包括解决的问题或添加的功能
   - 提交 PR

### 代码审查流程

所有提交的代码都将经过审查。在审查过程中：

1. 维护者会检查代码质量、功能实现和测试覆盖率
2. 可能会要求进行修改或提供更多信息
3. 一旦审查通过，代码将被合并到主分支

请耐心等待审查过程，并积极响应反馈。

## 开发指南

### 项目结构

```
scratchmirror/
├── bin/                  # 启动脚本
├── docs/                 # 文档
├── middleware/           # Express 中间件
├── prisma/               # Prisma 数据库模型
├── public/               # 静态资源
├── routes/               # API 路由
├── utils/                # 工具函数
│   ├── cache/            # 缓存相关
│   ├── ratelimit/        # 限速相关
│   └── security/         # 安全相关
├── views/                # 视图模板
├── .env.example          # 环境变量示例
├── .eslintrc.json        # ESLint 配置
├── .prettierrc.json      # Prettier 配置
├── app.js                # 应用入口
├── docker-compose.yml    # Docker 配置
├── Dockerfile            # Docker 构建文件
├── instrumentation.js    # 监控配置
└── package.json          # 项目依赖
```

### 编码规范

- **JavaScript**: 使用 ES6+ 语法，遵循 ESLint 和 Prettier 配置
- **命名约定**:
  - 文件名: 使用小驼峰命名法 (camelCase)
  - 类名: 使用大驼峰命名法 (PascalCase)
  - 变量和函数: 使用小驼峰命名法 (camelCase)
  - 常量: 使用大写下划线命名法 (UPPER_SNAKE_CASE)
- **注释**: 为所有函数、类和复杂逻辑添加 JSDoc 注释
- **异步代码**: 优先使用 async/await 而非回调或 Promise 链

### 测试指南

我们使用 Jest 进行测试。在添加新功能或修复 bug 时，请确保添加或更新相应的测试。

运行测试:

```bash
npm test
```

运行特定测试:

```bash
npm test -- -t "test name pattern"
```

### 文档指南

- 更新 API 文档时，请确保包含所有参数、返回值和示例
- 添加新功能时，请在相应的文档中添加说明
- 文档使用 Markdown 格式编写

## 版本控制与发布

我们使用 [语义化版本控制](https://semver.org/) 进行版本管理:

- **主版本号 (X.0.0)**: 不兼容的 API 变更
- **次版本号 (0.X.0)**: 向后兼容的功能新增
- **修订号 (0.0.X)**: 向后兼容的问题修复

### 分支策略

- **main**: 稳定版本分支，所有发布版本都来自此分支
- **develop**: 开发分支，所有功能分支都基于此分支创建
- **feature/\***: 新功能分支
- **fix/\***: 问题修复分支
- **release/\***: 发布准备分支

### 提交信息规范

我们采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范:

```
<类型>[可选作用域]: <描述>

[可选正文]

[可选脚注]
```

类型包括:
- **feat**: 新功能
- **fix**: 问题修复
- **docs**: 文档更新
- **style**: 代码风格变更（不影响功能）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具变更

示例:
```
feat(cache): 添加项目缓存预热功能

添加系统启动时自动预热缓存的功能，提高首次访问速度。

Closes #123
```

## 特性开发流程

1. **讨论**: 在 GitHub Issues 中讨论新功能
2. **设计**: 提出实现方案和 API 设计
3. **实现**: 编写代码和测试
4. **审查**: 提交 PR 并接受代码审查
5. **合并**: 通过审查后合并到开发分支
6. **发布**: 在下一个版本中发布

## 问题修复流程

1. **报告**: 在 GitHub Issues 中报告问题
2. **确认**: 维护者确认问题并分配
3. **修复**: 编写修复代码和测试
4. **审查**: 提交 PR 并接受代码审查
5. **合并**: 通过审查后合并到开发分支
6. **发布**: 根据严重程度决定是立即发布还是在下一个版本中发布

## 获取帮助

如果您在贡献过程中需要帮助，可以通过以下方式获取支持:

- 在 GitHub Issues 中提问
- 联系项目维护者: sun@wuyuan.dev

## 致谢

感谢所有为 ScratchMirror 项目做出贡献的开发者！您的参与使这个项目变得更好。
