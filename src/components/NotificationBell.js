import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Bell, Check, Clock, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';

const TYPE_ICONS = {
  time_submitted: Clock,
  time_approved: CheckCircle,
  time_rejected: XCircle,
  join_approved: UserCheck,
  join_rejected: UserX,
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;

  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const NotificationItem = memo(({ notification, onMarkRead }) => {
  const IconComponent = TYPE_ICONS[notification.type] || Bell;
  const isUnread = !notification.isRead;

  const handleClick = useCallback(() => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
  }, [isUnread, notification.id, onMarkRead]);

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
        isUnread ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${isUnread ? 'text-blue-600' : 'text-gray-400'}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </span>
            {isUnread && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          {notification.message && (
            <p className="text-xs text-gray-500 mt-0.5" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {notification.message}
            </p>
          )}
          <span className="text-xs text-gray-400 mt-1 block">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
});

const NotificationBell = memo(() => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const dataService = getDataService();
      const [notifs, count] = await Promise.all([
        dataService.getNotifications(user.id, { limit: 20 }),
        dataService.getUnreadNotificationCount(user.id)
      ]);
      setNotifications(notifs || []);
      setUnreadCount(count || 0);
    } catch (e) {
      // 알림 로드 실패는 무시
    }
  }, [user]);

  // 초기 로드 + 30초 폴링 + notification-created 이벤트
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    const handler = () => loadNotifications();
    window.addEventListener('notification-created', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-created', handler);
    };
  }, [loadNotifications]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = useCallback(async (notificationId) => {
    try {
      const dataService = getDataService();
      await dataService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      // 읽음 처리 실패는 무시
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;
    try {
      const dataService = getDataService();
      await dataService.markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // 전체 읽음 실패는 무시
    }
  }, [user, unreadCount]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="알림"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-semibold text-gray-900">알림</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                모두 읽음
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default NotificationBell;
