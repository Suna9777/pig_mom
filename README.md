# 猪猪妈妈

华中师范大学（CCNU）在校学生校园生活全能指南 App，服务范围限定武汉市。

## 技术栈

- **Expo SDK 56** + React Native + TypeScript
- **React Navigation 6.x**（底部 Tab + Stack 导航）
- **React Context + useReducer** 全局状态管理
- **AsyncStorage** 本地数据持久化

## 功能概览

### 首页
- 全站搜索（板块文章、帖子模糊匹配，搜索历史持久化）
- 九大生活板块入口
- 板块详情：基础知识 / CCNU专属 / 经验分享

### 社群
- 帖子列表（下拉刷新、上拉分页，每页10条）
- 标签筛选、发布帖子（求助/分享/交易）
- 点赞、收藏、评论、举报、屏蔽用户
- 求助帖「有用」与「已解决」标记

### 我的
- 个人信息（头像、昵称、ID）
- 我的提问、收藏、草稿、浏览历史、点赞/评论记录
- 关注、系统通知（Tab 角标）
- 设置（账号安全、通用、隐私、帮助、关于）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行 Android
npm run android

# 运行 iOS（需 macOS）
npm run ios

# 运行 Web
npm run web
```

使用 [Expo Go](https://expo.dev/go) 扫描终端二维码即可在手机上预览。

## 项目结构

```
src/
├── components/     # 可复用组件
├── constants/      # 常量、主题、板块定义
├── context/        # 全局状态 Context
├── data/           # 模拟数据
├── navigation/     # 导航配置
├── screens/        # 页面
├── services/       # 存储 & API 预留层
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## API 对接

`src/services/api.ts` 中预留了后端 API 函数占位，将来替换 `fetch` 调用即可对接真实后端。

## 版本

当前版本：1.0.0
