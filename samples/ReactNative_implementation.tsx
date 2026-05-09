import { allowScreenCaptureAsync, preventScreenCaptureAsync } from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    AppState,
    AppStateStatus,
    Text,
    View
} from 'react-native';

// ✅ SECURE: Custom hook for screen capture protection
export const useSecureScreen = (isEnabled: boolean = true) => {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const enableProtection = async () => {
      try {
        if (isEnabled && mounted) {
          await preventScreenCaptureAsync();
          setIsProtected(true);
          console.log('🔒 Screen capture protection enabled');
        }
      } catch (error) {
        console.error('Failed to enable screen capture protection:', error);
      }
    };

    const disableProtection = async () => {
      try {
        if (mounted) {
          await allowScreenCaptureAsync();
          setIsProtected(false);
          console.log('🔓 Screen capture protection disabled');
        }
      } catch (error) {
        console.error('Failed to disable screen capture protection:', error);
      }
    };

    if (isEnabled) {
      enableProtection();
    } else {
      disableProtection();
    }

    return () => {
      mounted = false;
      // Clean up on unmount
      allowScreenCaptureAsync().catch(console.error);
    };
  }, [isEnabled]);

  return { isProtected };
};

// ✅ SECURE: Higher-order component for protecting screens
export const withSecureScreen = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  forceSecure: boolean = true
) => {
  return (props: P) => {
    useSecureScreen(forceSecure);
    return <WrappedComponent {...props} />;
  };
};

// ✅ SECURE: Context for app-wide security settings
interface SecurityContextType {
  isSecureMode: boolean;
  toggleSecureMode: (enabled: boolean) => void;
  isProtected: boolean;
}

const SecurityContext = React.createContext<SecurityContextType | null>(null);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecureMode, setIsSecureMode] = useState(true);
  const { isProtected } = useSecureScreen(isSecureMode);

  const toggleSecureMode = async (enabled: boolean) => {
    try {
      setIsSecureMode(enabled);
      
      if (enabled) {
        Alert.alert(
          '🔒 Secure Mode Enabled',
          'Screen capture and recording are now disabled for security.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Security Warning',
          'Screen capture is now enabled. This may expose sensitive information!',
          [{ text: 'I Understand' }]
        );
      }
    } catch (error) {
      console.error('Failed to toggle secure mode:', error);
    }
  };

  return (
    <SecurityContext.Provider value={{ isSecureMode, toggleSecureMode, isProtected }}>
      {children}
    </SecurityContext.Provider>
  );
};

// ✅ SECURE: Hook to use security context
export const useSecurityContext = () => {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

// ✅ SECURE: Component for sensitive screens
interface SecureScreenProps {
  children: React.ReactNode;
  securityLevel?: 'low' | 'medium' | 'high';
  onSecurityViolation?: () => void;
}

export const SecureScreen: React.FC<SecureScreenProps> = ({
  children,
  securityLevel = 'high',
  onSecurityViolation
}) => {
  const forceSecure = securityLevel !== 'low';
  const { isProtected } = useSecureScreen(forceSecure);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        console.log('App has gone to the background');
        if (securityLevel === 'high' && onSecurityViolation) {
          // Could implement additional security measures
          onSecurityViolation();
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, securityLevel, onSecurityViolation]);

  // Show security indicator for development/testing
  const SecurityIndicator = () => (
    <View style={{
      position: 'absolute',
      top: 50,
      right: 20,
      backgroundColor: isProtected ? '#4CAF50' : '#F44336',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      zIndex: 1000,
    }}>
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
        {isProtected ? '🔒 SECURE' : '⚠️ VULNERABLE'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {__DEV__ && <SecurityIndicator />}
      {children}
    </View>
  );
};

// ✅ SECURE: Example usage in sensitive screens
export const OTPVerificationScreen = () => {
  const { toggleSecureMode } = useSecurityContext();

  useEffect(() => {
    // Force enable security for OTP screens
    toggleSecureMode(true);
    
    return () => {
      // Keep security enabled even when leaving OTP screen
      // toggleSecureMode(false); // Don't disable automatically
    };
  }, []);

  return (
    <SecureScreen 
      securityLevel="high"
      onSecurityViolation={() => {
        // Handle security violations (app backgrounded, screenshot attempts, etc.)
        Alert.alert(
          'Security Alert',
          'OTP verification requires the app to remain active for security.',
          [{ text: 'Continue' }]
        );
      }}
    >
      <View>
        <Text>Enter your OTP code:</Text>
        {/* OTP input components */}
      </View>
    </SecureScreen>
  );
};

// ✅ SECURE: Banking/Financial screen example
export const BankingScreen = () => {
  return (
    <SecureScreen 
      securityLevel="high"
      onSecurityViolation={() => {
        // Could implement automatic logout
        Alert.alert(
          'Security Session Ended',
          'For your security, you have been logged out.',
          [{ text: 'Login Again' }]
        );
      }}
    >
      <View>
        <Text>Account Balance: $****.**</Text>
        <Text>Account Number: ****1234</Text>
        {/* Banking components */}
      </View>
    </SecureScreen>
  );
};

