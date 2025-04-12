# Clash 订阅配置工具

一个简单易用的 Clash 订阅配置管理工具，帮助您管理和自定义 Clash 订阅。该工具能够添加自定义节点、增加自定义规则并管理多个订阅源。

## 功能特性

- 🔒 安全登录：使用基本认证保护您的配置
- 📋 管理多个订阅源：添加、编辑、删除多个订阅源
- 🌍 自定义节点：为任何订阅添加自定义节点
- 📝 自定义规则：添加个性化规则以满足特定需求
- 🔄 生成 Clash 配置：自动合并订阅内容与自定义配置
- 🔗 生成专属订阅链接：可直接在 Clash 客户端使用

## 安装

### 环境要求

- Node.js 16 或更高版本
- npm 或 pnpm 包管理器

### 本地开发

1. 克隆仓库

```bash
git clone <repository-url>
cd clash-config
```

2. 安装依赖

```
npm install
```
或
```
pnpm install
```

3. 启动开发服务器

```
npm run dev
```
或
```
pnpm run dev
```

开发服务器将启动在 `http://localhost:8787`。

### 部署

项目基于 Cloudflare Workers 构建，可以轻松部署到 Cloudflare 平台：

```
npm run deploy
```
或
```
pnpm run deploy
```

## 使用指南

### 初始设置

1. 访问应用首页，使用默认凭据登录：
   - 用户名：`admin`
   - 密码：`admin`

2. 首次登录后请立即修改默认密码。

### 管理订阅

1. **添加订阅**
   - 点击"添加订阅"按钮
   - 输入订阅名称和URL
   - 点击提交

2. **编辑订阅**
   - 在订阅列表中找到目标订阅
   - 点击"编辑"按钮
   - 修改相关信息后提交

3. **删除订阅**
   - 在订阅列表中找到目标订阅
   - 点击"删除"按钮
   - 确认删除操作

### 自定义节点

1. **添加节点**
   - 在订阅详情页点击"管理节点"
   - 点击"添加节点"按钮
   - 填写节点信息并提交

2. **编辑/删除节点**
   - 在节点列表中操作对应的编辑或删除按钮

### 自定义规则

1. **添加规则**
   - 在订阅详情页点击"管理规则"
   - 点击"添加规则"按钮
   - 选择规则类型、填写规则内容和策略
   - 提交表单

2. **删除规则**
   - 在规则列表中找到目标规则
   - 点击"删除"按钮确认删除

### 使用订阅链接

每个订阅都有一个唯一的链接，格式为：

```
https://<your-domain>/clash/<subscription-id>
```

将此链接添加到您的 Clash 客户端即可使用自定义后的配置。

## 环境变量

应用支持以下环境变量配置：

- `AUTH_USERNAME`: 管理员用户名（默认：admin）
- `AUTH_PASSWORD`: 管理员密码（默认：admin）

## 技术栈

- [Hono](https://honojs.dev/) - 现代化的快速 Web 框架
- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [TypeScript](https://www.typescriptlang.org/) - 类型化的 JavaScript
- [JSX](https://reactjs.org/docs/introducing-jsx.html) - 声明式 UI 构建

## 贡献指南

欢迎提交问题和改进建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 MIT 许可证发布 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过 Issue 与我们联系。
