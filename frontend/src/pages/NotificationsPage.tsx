import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17231F]">Notifications Inbox</h1>
          <p className="text-xs text-[#75817A] mt-1">
            Real-time updates on terms acceptance, M-Pesa custody deposits, courier tracking, and inspection deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            icon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        {notifications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Bell className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#17231F]">No notifications yet</h4>
            <p className="text-xs text-[#75817A]">You will be notified whenever an escrow event occurs.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !n.is_read ? 'bg-[#EBFDD6]/20' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.is_read ? 'bg-[#103D32] text-[#B7F36B]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#17231F] flex items-center gap-2">
                      {n.title}
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#218653] inline-block"></span>
                      )}
                    </h4>
                    <p className="text-xs text-[#75817A] mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {n.link && (
                  <Button variant="ghost" size="sm" className="shrink-0 text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default NotificationsPage;
