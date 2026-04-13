# Execution Checklist

- ID: `EXEC-00`
- Mode: `hard-cut`
- Goal: 按已确认策略把项目从 `LobsterAI` 收敛到 `JdiClaw`，不兼容旧协议、旧导出文件、旧 session key，并先完成配置抽象，再等待真实服务地址填值
- Priority: `P0 -> P2`
- Status: `active`

## Source of Truth

本文件是当前阶段的**直接执行任务单**。

执行时以本文件为准，主计划只负责描述阶段与优先级，不再重复展开逐条执行细节。

## Global Constraints

- 最终系统身份固定为 `com.jdiclaw.app` 与 `jdiclaw://`
- 不兼容旧 `LobsterAI` 本地数据、旧导出文件、旧 session key
- 新的服务端真实地址暂未准备好，当前阶段只做配置抽象，不直接填最终实值
- 不要误改 `OpenClaw/openclaw`、npm 包名、插件 ID、第三方 SDK 协议名
- 代码方法修改时必须补详细注释，说明设计意图和边界

## Task 1: 建立统一品牌与服务配置入口

### Files

- `src/main/appConstants.ts`
- `src/renderer/constants/app.ts`
- `src/main/libs/endpoints.ts`
- `src/renderer/services/endpoints.ts`
- `src/renderer/components/Settings.tsx`
- `src/renderer/components/PrivacyDialog.tsx`
- 允许新增：`src/shared/platform/`

### Required Changes

- 新增共享常量模块，例如 `src/shared/platform/brand.ts` 与 `src/shared/platform/endpoints.ts`
- 将品牌常量、导出格式、默认口令、登录、Portal、下载、协议页、手册、社群等入口统一收口
- 主进程与渲染进程统一从共享配置模块读取
- 删除组件和 service 层内散落的旧地址硬编码
- 用户手册入口先固定为 `https://joyspace.jd.com/h/personal/pages/tUGZC42TEC79IIcvqkSA`
- 用户社群先固定为常显文案 `10227855752`，当前阶段不再跳外链
- 相关方法补详细注释，明确“当前阶段先抽象配置、不填最终实值”

### Validation

- Command:
  - `rg -n "lobsterai.youdao.com|c.youdao.com/dict/hardware/lobsterai|api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai" src/main src/renderer`
- Pass When:
  - 搜索结果只命中新配置模块或明确说明用途的注释

## Task 2: 硬切应用壳层身份到 JdiClaw

### Files

- `electron-builder.json`
- `src/main/main.ts`
- `src/main/i18n.ts`
- `src/main/logger.ts`
- `src/main/trayManager.ts`
- `package.json`

### Required Changes

- 将 `appId` 改为 `com.jdiclaw.app`
- 将 `productName`、`executableName`、协议注册名称全部改为 `JdiClaw`
- 将 deep link scheme 从 `lobsterai://` 改为 `jdiclaw://`
- 将协议解析、托盘文案、日志标题、作者名和邮箱中的产品身份切换为 JdiClaw
- 不保留 `lobsterai://` fallback
- deep link 相关方法补详细注释，明确当前版本不兼容旧 scheme

### Validation

- Command:
  - `rg -n "lobsterai://|com\\.lobsterai\\.app|Open LobsterAI|打开 LobsterAI|LobsterAI started" src/main electron-builder.json package.json`
- Pass When:
  - 搜索结果为 `0`

## Task 3: 硬切数据契约和本地标识

### Files

- `src/renderer/constants/app.ts`
- `src/main/im/nimGateway.ts`
- `src/main/libs/openclawConfigSync.ts`
- `src/main/libs/openclawChannelSessionSync.ts`
- 其他与导出格式、session key、marker 相关的模块

### Required Changes

- 将 `APP_ID`、`EXPORT_FORMAT_TYPE`、`EXPORT_PASSWORD` 切换为 `jdiclaw` 体系
- 将 managed marker、session key 前缀等内部字符串改为新值
- 删除 `.lobsterai` fallback
- 删除旧契约兼容分支、兼容注释和迁移提示
- 每个关键方法补详细注释，明确“为什么这里允许直接硬切且不做迁移”

### Validation

- Command:
  - `rg -n "lobsterai.providers|lobsterai-APP|\\.lobsterai|LobsterAI managed" src/main src/renderer`
- Pass When:
  - 搜索结果为 `0`

## Task 4: 清理运行时品牌注入和隐性身份泄漏

### Files

- `src/main/libs/openclawMemoryFile.ts`
- `src/main/libs/agentEngine/openclawRuntimeAdapter.ts`
- `openclaw-extensions/mcp-bridge/index.ts`
- `src/main/skillManager.ts`
- `src/main/libs/githubCopilotAuth.ts`

### Required Changes

- 替换默认 identity 文案中的旧品牌
- 替换 system prompt / context bridge 前缀中的旧品牌
- 替换 `clientDisplayName`
- 替换下载器和外部请求中的 `User-Agent`
- 替换插件描述中的旧品牌说明
- 注释中区分“产品身份”和“上游依赖名”，避免误改 `OpenClaw`

### Validation

- Command:
  - `rg -n "LobsterAI|lobsterai" src/main openclaw-extensions`
- Pass When:
  - 仅保留明确不能替换的上游依赖说明；理想状态接近 `0`

## Task 5: 统一 Logo、分享图、tray 与安装包图标链路

### Files

- `index.html`
- `src/renderer/components/cowork/CoworkView.tsx`
- `src/renderer/components/Settings.tsx`
- `src/renderer/components/cowork/CoworkSessionDetail.tsx`
- `public/jdiclaw-logo.svg`
- `public/logo.png`
- `build/icons/`
- `resources/tray/`

### Required Changes

- 确定唯一品牌资源入口
- 页面、分享卡片、About、首页欢迎区统一改用该资源
- tray 与安装包图标统一到同一套品牌资源
- 去掉旧 `logo.png` 的兼容语义

### Validation

- Command:
  - `rg -n "src=\"logo\\.png\"|img\\.src = 'logo\\.png'" src/renderer`
- Manual Check:
  - 启动应用后检查首页、设置 About、分享图、tray、安装包图标是否一致
- Pass When:
  - 代码不再直接依赖旧 `logo.png`
  - 人工检查视觉资源一致

## Task 6: 收口设置页 About、协议页和用户可见品牌文案

### Files

- `src/renderer/components/Settings.tsx`
- `src/renderer/components/PrivacyDialog.tsx`
- `src/renderer/services/i18n.ts`
- `src/main/i18n.ts`

### Required Changes

- 去掉首次隐私/服务协议弹窗，不再依赖 `privacy_agreed` 首次确认
- 设置页 About 去掉联系邮箱入口
- 设置页 About 保留用户手册入口，但链接统一从共享配置模块读取
- 设置页 About 将用户社群改为常显文案 `10227855752`
- 设置页 About 去掉服务条款入口
- MCP 模块先去掉“市场” TAB，只保留当前阶段需要的已安装/自定义能力
- 其余联系邮箱、用户手册、用户社群、服务条款、配额提示、tray 文案等用户可见口径统一收口为 JdiClaw 口径
- 真实外链未就绪时，只能从统一配置模块读取占位值
- 不允许组件内部继续硬编码旧地址

### Validation

- Command:
  - `rg -n "lobsterai.project@|lobsterai_user_manual|lobsterai_service|Open LobsterAI|打开 LobsterAI" src/main src/renderer`
- Pass When:
  - 搜索结果为 `0`

## Task 7: 同步文档、台账和测试基线

### Files

- `README.md`
- `README_zh.md`
- `JdiClaw-backlog.md`
- `JdiClaw-tasks/README.md`
- 品牌相关测试文件

### Required Changes

- 更新 clone 路径、目录名、数据库名、品牌说明、当前硬切策略说明
- 把“不兼容旧 LobsterAI 数据/协议”的约束写清楚
- 修正所有应随产品改名而变化的断言与 fixture
- 删除已失效的迁移建议

### Validation

- Command:
  - `rg -n "git clone https://github.com/netease-youdao/LobsterAI.git|cd lobsterai|lobsterai.sqlite" README.md README_zh.md`
- Pass When:
  - 搜索结果为 `0`

## Task 8: 做整体验证并建立 grep 守门

### Required Changes

- 执行静态检查、测试、构建和主流程人工验收
- 建立最终品牌残留 grep 清单
- 如果 grep 仍有残留，回到对应任务继续修正

### Validation

- Command:
  - `npm run lint`
  - `npm test`
  - `npm run compile:electron`
  - `npm run build`
  - `rg -n "LobsterAI|lobsterai" src/main src/renderer README.md README_zh.md electron-builder.json package.json`
- Manual Check:
  - `npm run electron:dev`
  - 检查窗口标题、协议唤起、登录窗标题、首页 logo、设置 About、导入导出、tray、分享图
  - 检查首次启动不再出现隐私/服务协议弹窗
  - 检查设置 About 只显示版本、用户手册、常显社群号、日志导出
  - 检查 MCP 页面不再出现市场 TAB
- Pass When:
  - 构建和测试通过
  - 主流程人工验收通过
  - 品牌残留 grep 结果只剩明确允许保留的外部依赖名

## Task 9: 真实服务地址准备好后的填值切换

### Status

- `blocked`

### Required Changes

- 只修改统一配置模块中的测试/生产地址
- 不允许顺手修改页面组件和业务逻辑
- 联调登录、Portal、更新、下载、协议页跳转

### Start When

- 新的服务端真实地址、Portal 地址、用户手册地址、协议页地址均已确认

## Stop If

- 发现需要兼容旧 `lobsterai://`、旧导出文件或旧 session key 才能继续
- 发现必须修改 `OpenClaw` 依赖名、插件 ID 或第三方包名才能继续
- 发现真实服务地址尚未确认，却必须往业务代码里硬写正式值

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
