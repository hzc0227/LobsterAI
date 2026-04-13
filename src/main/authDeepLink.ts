import { APP_PROTOCOL_PREFIX, APP_PROTOCOL_SCHEME } from '../shared/platform';

const AUTH_CALLBACK_HOST = 'auth';
const AUTH_CALLBACK_PATHNAME = '/callback';

/**
 * 从操作系统回传的 JdiClaw deep link 中提取一次性登录 code。
 *
 * 当前 hard-cut 版本只接受 `jdiclaw://auth/callback?code=...`。这里故意不兼容
 * 旧品牌 scheme，因为任务二要求把协议壳层身份整体硬切到 JdiClaw；
 * 如果仍然默默接受旧 scheme，就会让新旧客户端都可能抢占登录回跳，也会掩盖
 * 代码里尚未清理完的旧品牌残留。
 *
 * @param url 由系统协议分发回来的原始 URL。
 * @returns 提取成功时返回 auth code；否则返回 null。
 */
export const extractAuthCodeFromDeepLink = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${APP_PROTOCOL_SCHEME}:`) {
      return null;
    }
    if (parsed.hostname !== AUTH_CALLBACK_HOST || parsed.pathname !== AUTH_CALLBACK_PATHNAME) {
      return null;
    }
    return parsed.searchParams.get('code');
  } catch {
    return null;
  }
};

/**
 * 在 Windows/Linux 的命令行参数里查找 JdiClaw deep link。
 *
 * 这两个平台通常会把协议 URL 当作 argv 传入，因此这里统一只匹配新的
 * `jdiclaw://` 前缀，不保留旧品牌 fallback。这样冷启动和二次唤起
 * 都遵循同一套硬切规则，不会在某一条路径里继续兼容旧协议。
 *
 * @param args 需要扫描的命令行参数列表。
 * @returns 第一条匹配的新协议 URL；如果不存在则返回 `undefined`。
 */
export const findAuthDeepLinkInArgs = (args: string[]): string | undefined => {
  return args.find((arg) => arg.startsWith(APP_PROTOCOL_PREFIX));
};
