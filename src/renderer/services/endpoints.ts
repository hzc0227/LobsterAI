/**
 * 集中管理所有业务 API 端点。
 * 后续新增的业务接口也应在此文件中配置。
 */

import { configService } from './config';

const isTestMode = () => {
  return configService.getConfig().app?.testMode === true;
};

// 自动更新
export const getUpdateCheckUrl = () => isTestMode()
  ? 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update'
  : 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update';

// 手动检查更新
export const getManualUpdateCheckUrl = () => isTestMode()
  ? 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update-manual'
  : 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update-manual';

export const getFallbackDownloadUrl = () => isTestMode()
  ? 'https://lobsterai.inner.youdao.com/#/download-list'
  : 'https://lobsterai.youdao.com/#/download-list';

// Skill 商店
export const getSkillStoreUrl = () => {
  // 原有有道 skills 市场接口，保留便于排查：
  // test: https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/skill-store
  // prod: https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/skill-store
  // 当前自定义 skills 市场接口：
  // test: http://localhost:9111/skill-store
  // prod: http://11.103.146.140:9111/skill-store
  return isTestMode()
    ? 'http://localhost:9111/skill-store'
    : 'http://11.103.146.140:9111/skill-store';
};

/**
 * 技能诉求提交接口。
 *
 * 当前约定与 skills 市场服务复用同一个服务域名，只在路径后追加 `/requests`。
 * 如果后端后续把诉求能力拆到独立服务，只需要修改这里，页面与 service 层都无需改动。
 */
export const getSkillRequestSubmitUrl = () => `${getSkillStoreUrl().replace(/\/+$/, '')}/requests`;

// 登录地址
export const getLoginOvermindUrl = () => isTestMode()
  ? 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/login-url'
  : 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/login-url';

// Portal 页面
const PORTAL_BASE_TEST = 'https://c.youdao.com/dict/hardware/cowork/lobsterai-portal.html#';
const PORTAL_BASE_PROD = 'https://c.youdao.com/dict/hardware/octopus/lobsterai-portal.html#';

const getPortalBase = () => isTestMode() ? PORTAL_BASE_TEST : PORTAL_BASE_PROD;

export const getPortalPricingUrl = () => `${getPortalBase()}/pricing`;
export const getPortalProfileUrl = () => `${getPortalBase()}/profile`;
