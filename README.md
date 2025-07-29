# ReactFlow Replay Demo

一个基于 React Flow 的交互式流程图编辑器，支持操作回放功能。

## 功能特性

- 🎯 **交互式节点编辑** - 添加、移动、删除节点
- 🔗 **连接线管理** - 创建和删除节点间的连接
- 📹 **操作回放** - 记录并回放所有用户操作
- 🎮 **实时控制** - 支持暂停、继续、清空操作
- 📊 **可视化界面** - 包含缩略图、控制面板和背景网格

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **React Flow** - 流程图组件库
- **Vite** - 构建工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 使用说明

### 基本操作

1. **添加节点** - 点击 "Add node" 按钮在随机位置创建新节点
2. **移动节点** - 拖拽节点到任意位置
3. **创建连接** - 从一个节点的连接点拖拽到另一个节点
4. **删除连接** - 选中连接线后按删除键

### 回放功能

1. **开始回放** - 点击 "Replay" 按钮开始回放所有操作
2. **停止回放** - 回放过程中点击 "Stop replay" 按钮
3. **清空操作** - 点击 "Clear all" 按钮清空所有节点和操作记录

### 状态显示

- 右下角显示当前记录的事件数量
- 回放时显示当前回放进度

## 项目结构

```
src/
├── App.tsx          # 主应用组件
├── main.tsx         # 应用入口
├── hooks/           # 自定义 Hook
│   └── useReplay.ts # 回放功能 Hook
└── types/           # TypeScript 类型定义
    └── replay.ts    # 回放相关类型
```

## 核心功能实现

### 事件记录系统

项目实现了完整的用户操作记录系统，包括：

- 节点添加/删除/移动
- 连接线创建/删除
- 视图缩放/平移

### 回放机制

- 基于时间轴的事件回放
- 支持暂停和继续
- 实时显示回放进度

## 开发说明

### 自定义 Hook

`useReplay` Hook 提供了完整的回放功能：

```typescript
const { replayState, recordEvent, startReplay, stopReplay, clearEvents } = useReplay()
```

### 事件类型

支持以下事件类型：
- `node_add` - 节点添加
- `node_update` - 节点更新
- `node_delete` - 节点删除
- `edge_add` - 连接添加
- `edge_delete` - 连接删除
- `viewport_change` - 视图变化

## 许可证

MIT License