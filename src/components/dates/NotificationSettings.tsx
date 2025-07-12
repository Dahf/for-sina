import React, { useState, useEffect } from 'react';
import type { NotificationPermission } from '../../services/notificationService';
import { notificationService } from '../../services/notificationService';
import './NotificationSettings.css';

interface NotificationSettingsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onPermissionChange }) => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    supported: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if ('Notification' in window) {
      const currentPermission: NotificationPermission = {
        granted: Notification.permission === 'granted',
        supported: true
      };
      setPermission(currentPermission);
      onPermissionChange?.(currentPermission);
    } else {
      const noSupport: NotificationPermission = {
        granted: false,
        supported: false
      };
      setPermission(noSupport);
      onPermissionChange?.(noSupport);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      onPermissionChange?.(newPermission);
      
      if (newPermission.granted) {
        // Test notification
        await notificationService.showNotification(
          '🎉 Benachrichtigungen aktiviert!',
          {
            body: 'Du wirst jetzt über wichtige Ereignisse informiert.',
            tag: 'permission-granted'
          }
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    await notificationService.showNotification(
      '🔔 Test-Benachrichtigung',
      {
        body: 'Dies ist eine Test-Benachrichtigung für deine Ereignisse.',
        tag: 'test-notification'
      }
    );
  };

  if (!permission.supported) {
    return (
      <div className="notification-settings">
        <div className="notification-status unsupported">
          <span className="status-icon">❌</span>
          <div className="status-text">
            <h3>Benachrichtigungen nicht unterstützt</h3>
            <p>Dein Browser unterstützt keine Push-Benachrichtigungen.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <h3>🔔 Push-Benachrichtigungen</h3>
        <p>Erhalte Erinnerungen für wichtige Ereignisse</p>
      </div>

      <div className={`notification-status ${permission.granted ? 'granted' : 'denied'}`}>
        <span className="status-icon">
          {permission.granted ? '✅' : '⚠️'}
        </span>
        <div className="status-text">
          <h4>
            {permission.granted ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen deaktiviert'}
          </h4>
          <p>
            {permission.granted 
              ? 'Du erhältst Erinnerungen basierend auf deinen Einstellungen.'
              : 'Aktiviere Benachrichtigungen, um keine wichtigen Ereignisse zu verpassen.'
            }
          </p>
        </div>
      </div>

      <div className="notification-actions">
        {!permission.granted && (
          <button 
            className="btn btn-primary"
            onClick={requestPermission}
            disabled={isLoading}
          >
            {isLoading ? 'Aktiviere...' : '🔔 Benachrichtigungen aktivieren'}
          </button>
        )}
        
        {permission.granted && (
          <button 
            className="btn btn-secondary"
            onClick={testNotification}
          >
            🧪 Test-Benachrichtigung
          </button>
        )}
      </div>

      {permission.granted && (
        <div className="notification-info">
          <h4>📋 Benachrichtigungsregeln</h4>
          <ul>
            <li>🔴 <strong>Hohe Priorität:</strong> Erfordern deine Aufmerksamkeit</li>
            <li>🟡 <strong>Mittlere Priorität:</strong> Normale Erinnerungen</li>
            <li>🟢 <strong>Niedrige Priorität:</strong> Sanfte Hinweise</li>
            <li>🔄 <strong>Wiederkehrende Ereignisse:</strong> Automatische Erinnerungen</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings; 