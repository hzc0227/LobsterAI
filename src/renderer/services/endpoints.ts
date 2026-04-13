/**
 * 集中管理所有业务 API 端点。
 * 后续新增的业务接口也应在此文件中配置。
 */

import {
  getFallbackDownloadUrlForEnvironment,
  getLoginOvermindUrlForEnvironment,
  getManualUpdateCheckUrlForEnvironment,
  getPortalPricingUrlForEnvironment,
  getPortalProfileUrlForEnvironment,
  getSkillRequestSubmitUrlForEnvironment,
  getSkillStoreUrlForEnvironment,
  getUpdateCheckUrlForEnvironment,
  resolvePlatformEnvironment,
} from '../../shared/platform/endpoints';
import { configService } from './config';

const isTestMode = () => {
  return configService.getConfig().app?.testMode === true;
};

/**
 * 根据渲染进程当前配置解析共享环境枚举。
 *
 * 渲染进程只负责读取本地 `testMode` 开关，真正的 URL 表已经统一迁移到
 * `src/shared/platform/endpoints.ts`。这样当前阶段可以先完成配置抽象，
 * 等真实 JdiClaw 地址准备好后，只修改共享模块即可，不需要再碰页面和 service。
 *
 * @returns 当前渲染进程应使用的共享环境值。
 */
const resolveCurrentEnvironment = () => {
  return resolvePlatformEnvironment(isTestMode());
};

// 自动更新
export const getUpdateCheckUrl = () => getUpdateCheckUrlForEnvironment(resolveCurrentEnvironment());

// 手动检查更新
export const getManualUpdateCheckUrl = () => getManualUpdateCheckUrlForEnvironment(resolveCurrentEnvironment());

export const getFallbackDownloadUrl = () => getFallbackDownloadUrlForEnvironment(resolveCurrentEnvironment());

// Skill 商店
export const getSkillStoreUrl = () => {
  /**
   * 当前阶段仍沿用占位技能市场地址，但地址本身已经统一迁移到共享模块。
   * 这里保留一个单独方法，是为了维持现有调用方 API 不变，同时把“配置抽象先行，
   * 最终地址后填”的约束锁死在共享层。
   */
  return getSkillStoreUrlForEnvironment(resolveCurrentEnvironment());
};

/**
 * 技能诉求提交接口。
 *
 * 当前约定与 skills 市场服务复用同一个服务域名，只在路径后追加 `/requests`。
 * 如果后端后续把诉求能力拆到独立服务，只需要修改这里，页面与 service 层都无需改动。
 */
export const getSkillRequestSubmitUrl = () => getSkillRequestSubmitUrlForEnvironment(resolveCurrentEnvironment());

// 登录地址
export const getLoginOvermindUrl = () => getLoginOvermindUrlForEnvironment(resolveCurrentEnvironment());

/**
 * 价格页和个人页都从共享 Portal 基地址派生，避免组件层继续散落 hash 路由拼接逻辑。
 * 当前依旧使用占位地址，但统一入口已经建立，后续真实地址切换时无需再到渲染层全文替换。
 */
export const getPortalPricingUrl = () => getPortalPricingUrlForEnvironment(resolveCurrentEnvironment());
export const getPortalProfileUrl = () => getPortalProfileUrlForEnvironment(resolveCurrentEnvironment());
