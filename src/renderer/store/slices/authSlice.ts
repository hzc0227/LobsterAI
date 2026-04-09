import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 渲染进程里的最小 ERP 登录态。
 *
 * 认证改造后，界面只需要知道“是否已登录”和“当前 ERP 是谁”，
 * 不再持有旧 Portal 方案中的用户资料、积分或套餐信息。
 */
interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  erp: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: true,
  erp: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 设置认证初始化或登录流程中的加载态。
     *
     * 应用启动恢复登录态时需要短暂显示 loading，以避免左下角先闪未登录、
     * 再跳成已登录的视觉抖动。
     */
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    /**
     * 写入当前已登录 ERP。
     *
     * 这个 reducer 只负责 ERP 登录成功后的最小状态同步，
     * 不再耦合用户资料、头像、积分等额外信息。
     */
    setLoggedIn(state, action: PayloadAction<{ erp: string }>) {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.erp = action.payload.erp;
    },

    /**
     * 清空当前 ERP 登录态。
     *
     * 退出登录、Cookie 失效或启动恢复发现会话已过期时，
     * 都统一走这个 reducer，把界面还原到未登录状态。
     */
    setLoggedOut(state) {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.erp = null;
    },
  },
});

export const { setAuthLoading, setLoggedIn, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
