import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { authService } from '../services/auth';
import { i18nService } from '../services/i18n';
import { RootState } from '../store';

const UserMenu: React.FC<{ erp: string; onClose: () => void }> = ({ erp, onClose }) => {
  /**
   * 退出当前 ERP 登录态。
   *
   * 主进程会负责清理独立登录分区里的 Cookie；这里在操作完成后关闭菜单，
   * 保持左下角交互反馈与当前登录状态一致。
   */
  const handleLogout = async () => {
    await authService.logout();
    onClose();
  };

  return (
    <div className="absolute bottom-full left-0 mb-1 w-[14.5rem] bg-surface rounded-xl shadow-popover border border-border overflow-hidden z-50 popover-enter">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-secondary">
          {i18nService.t('authErpLabel')}
        </div>
        <div className="mt-1 text-sm font-medium text-foreground break-all">
          {erp}
        </div>
      </div>
      <div className="py-1">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-surface-raised transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {i18nService.t('authLogout')}
        </button>
      </div>
    </div>
  );
};

const LoginButton: React.FC = () => {
  const { isLoggedIn, isLoading, erp } = useSelector((state: RootState) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (isLoading) {
    return null;
  }

  /**
   * 处理左下角登录按钮点击。
   *
   * 未登录时直接唤起 ERP 登录窗；已登录时则展开菜单，
   * 让左下角区域始终承担“展示当前 ERP + 退出登录”的职责。
   */
  const handleClick = async () => {
    if (isLoggedIn) {
      setShowMenu(!showMenu);
      return;
    }

    await authService.login();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-secondary hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer max-w-[148px]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
        <span className="truncate">
          {isLoggedIn && erp ? erp : i18nService.t('login')}
        </span>
      </button>
      {showMenu && isLoggedIn && erp && (
        <UserMenu
          erp={erp}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default LoginButton;
