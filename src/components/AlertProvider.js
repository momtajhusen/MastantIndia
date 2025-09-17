// AlertProvider.js
import React, { createContext, useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Alert Context
const AlertContext = createContext();

// Alert Types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  CONFIRM: 'confirm',
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (config) => {
    const alertId = Date.now() + Math.random();
    const newAlert = {
      id: alertId,
      ...config,
      visible: true,
    };
    setAlerts(prev => [...prev, newAlert]);
    return alertId;
  };

  const hideAlert = (id) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, visible: false } : alert
      )
    );
    // Remove from array after animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  };

  const hideAllAlerts = () => {
    setAlerts(prev =>
      prev.map(alert => ({ ...alert, visible: false }))
    );
    setTimeout(() => {
      setAlerts([]);
    }, 300);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, hideAllAlerts }}>
      {children}
      {alerts.map(alert => (
        <AlertModal
          key={alert.id}
          alert={alert}
          onHide={() => hideAlert(alert.id)}
        />
      ))}
    </AlertContext.Provider>
  );
};

// Individual Alert Modal Component
const AlertModal = ({ alert, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (alert.visible) {
      // Entry Animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit Animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [alert.visible]);

  // Auto hide after duration
  React.useEffect(() => {
    if (alert.duration && alert.visible) {
      const timer = setTimeout(() => {
        onHide();
      }, alert.duration);
      return () => clearTimeout(timer);
    }
  }, [alert.duration, alert.visible]);

  const getAlertConfig = () => {
    switch (alert.type) {
      case ALERT_TYPES.SUCCESS:
        return {
          backgroundColor: '#000000',
          icon: '✓',
          iconColor: '#FFFFFF',
        };
      case ALERT_TYPES.ERROR:
        return {
          backgroundColor: '#000000',
          icon: '✕',
          iconColor: '#FFFFFF',
        };
      case ALERT_TYPES.WARNING:
        return {
          backgroundColor: '#000000',
          icon: '⚠',
          iconColor: '#FFFFFF',
        };
      case ALERT_TYPES.INFO:
        return {
          backgroundColor: '#000000',
          icon: 'ℹ',
          iconColor: '#FFFFFF',
        };
      case ALERT_TYPES.CONFIRM:
        return {
          backgroundColor: '#000000',
          icon: '?',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#000000',
          icon: 'ℹ',
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getAlertConfig();
  const hasActions = alert.actions && alert.actions.length > 0;

  return (
    <Modal
      transparent
      visible={alert.visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={() => alert.dismissible !== false && onHide()}
        />
        
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim },
              ],
            },
          ]}
        >
          {/* Alert Header with Icon */}
          <View style={[styles.header, { backgroundColor: config.backgroundColor }]}>
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color: config.iconColor }]}>
                {config.icon}
              </Text>
            </View>
          </View>

          {/* Alert Content */}
          <View style={styles.content}>
            {alert.title && (
              <Text style={styles.title}>{alert.title}</Text>
            )}
            {alert.message && (
              <Text style={styles.message}>{alert.message}</Text>
            )}
          </View>

          {/* Alert Actions */}
          {hasActions && (
            <View style={styles.actions}>
              {alert.actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    action.style === 'primary' && styles.primaryButton,
                    action.style === 'danger' && styles.dangerButton,
                    index > 0 && styles.actionMargin,
                  ]}
                  onPress={() => {
                    action.onPress && action.onPress();
                    if (action.dismiss !== false) {
                      onHide();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.style === 'primary' && styles.primaryText,
                      action.style === 'danger' && styles.dangerText,
                    ]}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Close button if no actions */}
          {!hasActions && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onHide}
            >
              <Text style={styles.closeText}>OK</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Hook to use Alert
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  dangerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  actionMargin: {
    marginLeft: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#000000',
  },
  closeButton: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

// Usage Example Component
export const AlertExample = () => {
  const { showAlert } = useAlert();

  const showSuccessAlert = () => {
    showAlert({
      type: ALERT_TYPES.SUCCESS,
      title: 'Service Completed!',
      message: 'Your service request has been completed successfully.',
      duration: 3000, // Auto hide after 3 seconds
    });
  };

  const showErrorAlert = () => {
    showAlert({
      type: ALERT_TYPES.ERROR,
      title: 'Service Failed',
      message: 'Unable to complete your service request. Please try again.',
    });
  };

  const showConfirmAlert = () => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Cancel Service',
      message: 'Are you sure you want to cancel this service request?',
      dismissible: false,
      actions: [
        {
          text: 'No',
          style: 'default',
        },
        {
          text: 'Yes, Cancel',
          style: 'danger',
          onPress: () => {
            // Handle cancel logic
            console.log('Service cancelled');
          },
        },
      ],
    });
  };

  const showWarningAlert = () => {
    showAlert({
      type: ALERT_TYPES.WARNING,
      title: 'Service Delay',
      message: 'Your service provider is running 15 minutes late. They will contact you shortly.',
      actions: [
        {
          text: 'OK',
          style: 'primary',
        },
        {
          text: 'Call Provider',
          style: 'default',
          onPress: () => {
            console.log('Calling provider...');
          },
        },
      ],
    });
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 20 }}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={showSuccessAlert}
      >
        <Text style={styles.primaryText}>Show Success Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={showErrorAlert}
      >
        <Text style={styles.dangerText}>Show Error Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={showWarningAlert}
      >
        <Text style={styles.actionText}>Show Warning Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={showConfirmAlert}
      >
        <Text style={styles.actionText}>Show Confirm Alert</Text>
      </TouchableOpacity>
    </View>
  );
};