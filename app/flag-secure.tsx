import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
    Alert,
    AppState,
    AppStateStatus,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ANDROID_SECURE_CODE = `// Android - Secure Implementation (FLAG_SECURE enabled)
// File: MainActivity.java

import android.os.Bundle;
import android.view.WindowManager;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable FLAG_SECURE to prevent screenshots and screen recording
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
        
        setContentView(R.layout.activity_main);
    }
    
    // Method to enable FLAG_SECURE for sensitive screens
    private void enableSecureMode() {
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
    
    // Method to disable FLAG_SECURE (INSECURE - for testing only)
    private void disableSecureMode() {
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}`;

const ANDROID_INSECURE_CODE = `// Android - Insecure Implementation (FLAG_SECURE disabled) ⚠️ VULNERABLE
// File: MainActivity.java

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ⚠️ SECURITY VULNERABILITY: FLAG_SECURE not set
        // Screenshots and screen recording are allowed!
        // Sensitive data (OTP, passwords, PIN) can be captured
        
        setContentView(R.layout.activity_main);
    }
    
    // ⚠️ VULNERABLE: No security protection implemented
    private void showSensitiveData() {
        // This sensitive information can be screenshot!
        // - User passwords
        // - OTP codes  
        // - Personal information
        // - Credit card details
    }
}`;

const IOS_SECURE_CODE = `// iOS - Secure Implementation (Privacy protection enabled)
// File: AppDelegate.swift

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    private var overlayView: UIView?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Setup privacy protection
        setupPrivacyProtection()
        return true
    }
    
    // Secure implementation to prevent screenshots
    private func setupPrivacyProtection() {
        // Hide content when app goes to background
        NotificationCenter.default.addObserver(
            self, 
            selector: #selector(hideContent), 
            name: UIApplication.willResignActiveNotification, 
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self, 
            selector: #selector(showContent), 
            name: UIApplication.didBecomeActiveNotification, 
            object: nil
        )
    }
    
    @objc private func hideContent() {
        // Add overlay to hide sensitive content
        guard let window = window else { return }
        
        overlayView = UIView(frame: window.bounds)
        overlayView?.backgroundColor = .black
        overlayView?.alpha = 0
        
        let logoImageView = UIImageView()
        logoImageView.contentMode = .scaleAspectFit
        logoImageView.translatesAutoresizingMaskIntoConstraints = false
        
        overlayView?.addSubview(logoImageView)
        window.addSubview(overlayView!)
        
        UIView.animate(withDuration: 0.3) {
            self.overlayView?.alpha = 1
        }
    }
    
    @objc private func showContent() {
        UIView.animate(withDuration: 0.3, animations: {
            self.overlayView?.alpha = 0
        }) { _ in
            self.overlayView?.removeFromSuperview()
            self.overlayView = nil
        }
    }
}`;

const IOS_INSECURE_CODE = `// iOS - Insecure Implementation (No privacy protection) ⚠️ VULNERABLE
// File: AppDelegate.swift

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // ⚠️ SECURITY VULNERABILITY: No privacy protection implemented
        // Screenshots can be taken of sensitive screens
        // App preview shows actual content in task switcher
        
        return true
    }
    
    // ⚠️ VULNERABLE: No background protection
    func applicationWillResignActive(_ application: UIApplication) {
        // No overlay or content hiding implemented
        // Sensitive data remains visible in:
        // - Screenshots
        // - App switcher preview  
        // - Screen recordings
    }
    
    // ⚠️ VULNERABLE: Sensitive screens not protected
    private func displaySensitiveContent() {
        // This content can be captured:
        // - OTP verification screens
        // - Password input fields
        // - Personal information
        // - Banking details
        // - Medical records
    }
}`;

const REACT_NATIVE_IMPLEMENTATION = `// React Native Implementation with expo-screen-capture
// Install: expo install expo-screen-capture

import { preventScreenCaptureAsync, allowScreenCaptureAsync } from 'expo-screen-capture';
import { useEffect, useState } from 'react';

export default function SecureScreen() {
  const [isSecure, setIsSecure] = useState(false);
  
  const toggleSecureMode = async (enableSecure: boolean) => {
    try {
      if (enableSecure) {
        // Enable screenshot/recording protection
        await preventScreenCaptureAsync();
        console.log('Screen capture disabled');
      } else {
        // Disable protection (for testing only)
        await allowScreenCaptureAsync();
        console.log('Screen capture enabled');
      }
      setIsSecure(enableSecure);
    } catch (error) {
      console.error('Failed to toggle secure mode:', error);
    }
  };
  
  useEffect(() => {
    // Enable secure mode by default for sensitive screens
    toggleSecureMode(true);
    
    return () => {
      // Clean up on unmount
      allowScreenCaptureAsync();
    };
  }, []);
  
  return (
    // Your sensitive UI components here
  );
}`;

export default function FlagSecureScreen() {
  const [isSecureMode, setIsSecureMode] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [selectedCodeTab, setSelectedCodeTab] = useState<'android' | 'ios' | 'rn'>('android');
  const [codeType, setCodeType] = useState<'secure' | 'insecure'>('secure');
  const [appState, setAppState] = useState(AppState.currentState);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState(false);
  const appStateSubscription = useRef<any>(null);

  // Monitor app state for background protection
  React.useEffect(() => {
    appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription.current?.remove();
    };
  }, [isSecureMode]);

  useFocusEffect(
    React.useCallback(() => {
      // Hide overlay when screen is focused
      setShowBackgroundOverlay(false);
    }, [])
  );

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      setShowBackgroundOverlay(false);
    } else if (
      appState === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to the background
      if (isSecureMode) {
        // Show overlay when in secure mode and app backgrounds
        setShowBackgroundOverlay(true);
      }
    }
    setAppState(nextAppState);
  };

  const handleToggleSecureMode = (value: boolean) => {
    setIsSecureMode(value);
    
    if (value) {
      Alert.alert(
        "🔒 Secure Mode Enabled",
        "FLAG_SECURE is now enabled.\n\n📱 On real devices:\n• Screenshots will be blocked\n• Screen recording will show black screen\n• App switcher will hide content\n\n⚠️ Note: Protection doesn't work in Expo Go or iOS Simulator. Requires development build with native code.",
        [{ text: "Understood" }]
      );
    } else {
      Alert.alert(
        "⚠️ Insecure Mode Enabled", 
        "FLAG_SECURE is disabled. This screen can now be screenshot or recorded.\n\n🚨 Security Risk:\n• OTP codes can be captured\n• Personal data exposed\n• Financial info vulnerable\n\n📱 In this simulator, you can see the content captured. On real devices, this data would be equally exposed to malware or social engineering attacks.",
        [
          { text: "I Understand the Risk", style: "destructive" }
        ]
      );
    }
  };

  const getDisplayCode = () => {
    if (selectedCodeTab === 'android') {
      return codeType === 'secure' ? ANDROID_SECURE_CODE : ANDROID_INSECURE_CODE;
    } else if (selectedCodeTab === 'ios') {
      return codeType === 'secure' ? IOS_SECURE_CODE : IOS_INSECURE_CODE;
    } else {
      return REACT_NATIVE_IMPLEMENTATION;
    }
  };

  const getRiskLevel = () => {
    return isSecureMode ? "LOW" : "HIGH";
  };

  const getStatusColor = () => {
    return isSecureMode ? "#4CAF50" : "#F44336";
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>FLAG_SECURE Demo</Text>
        <Text style={styles.subtitle}>Security Misconfiguration Testing</Text>
      </View>

      {/* Security Status */}
      <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={isSecureMode ? "shield-checkmark" : "warning"} 
            size={24} 
            color={getStatusColor()} 
          />
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {isSecureMode ? "SECURE" : "⚠️ VULNERABLE"}
          </Text>
        </View>
        
        <Text style={styles.statusDescription}>
          {isSecureMode 
            ? "Screenshots and screen recording are blocked on this screen"
            : "This screen can be captured via screenshots or recordings!"
          }
        </Text>
        
        <View style={styles.riskContainer}>
          <Text style={styles.riskLabel}>Risk Level: </Text>
          <Text style={[styles.riskLevel, { color: getStatusColor() }]}>
            {getRiskLevel()}
          </Text>
        </View>
      </View>

      {/* Control Section */}
      <View style={styles.controlCard}>
        <Text style={styles.cardTitle}>Security Control</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              FLAG_SECURE {isSecureMode ? "Enabled" : "Disabled"}
            </Text>
            <Switch
              value={isSecureMode}
              onValueChange={handleToggleSecureMode}
              trackColor={{ false: "#FF6B6B", true: "#4ECDC4" }}
              thumbColor={isSecureMode ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <Text style={styles.controlDescription}>
          Toggle to see the difference between secure and insecure implementations.
          {"\n\n"}When SECURE mode is enabled:
          {"\n"}✓ Simulator screenshots still work (limitation)
          {"\n"}✓ Minimize app → overlay appears (background protection)
          {"\n"}✓ Check recent apps → content hidden
          {"\n\n"}On real devices with native implementation:
          {"\n"}✓ Screenshots blocked entirely
          {"\n"}✓ Screen recording shows black screen
        </Text>
      </View>

      {/* Screenshot Simulation */}
      <View style={styles.simulationCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name="camera" size={16} /> Screenshot Simulation
        </Text>
        
        <Text style={styles.simulationLabel}>What a screenshot would capture:</Text>
        
        {isSecureMode ? (
          <View style={styles.secureScreenshot}>
            <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
            <Text style={styles.screenshotText}>🔒 Protected Content</Text>
            <Text style={styles.screenshotSubtext}>Screenshots blocked by FLAG_SECURE</Text>
          </View>
        ) : (
          <View style={styles.vulnerableScreenshot}>
            <Text style={styles.exposedLabel}>⚠️ EXPOSED SENSITIVE DATA:</Text>
            <Text style={styles.exposedText}>OTP: 123456</Text>
            <Text style={styles.exposedText}>Email: user@example.com</Text>
            <Text style={styles.exposedText}>Card: •••• 1234</Text>
            <Text style={styles.screenshotWarning}>
              This data would be visible in screenshots!
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.simulateButton}
          onPress={() => {
            Alert.alert(
              "📸 Screenshot Simulation",
              isSecureMode 
                ? "✅ Screenshot blocked! On a real device with proper FLAG_SECURE implementation, this screenshot would show a black screen or be completely prevented."
                : "⚠️ Screenshot captured! All sensitive content is now exposed and could be shared or stolen.",
              [{ text: "OK" }]
            );
          }}
        >
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={styles.simulateButtonText}>Simulate Screenshot</Text>
        </TouchableOpacity>
      </View>

      {/* Sensitive Content Simulation */}
      <View style={styles.sensitiveCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name="eye-off" size={16} /> Sensitive Content
        </Text>
        
        <View style={styles.sensitiveContent}>
          <Text style={styles.sensitiveLabel}>OTP Verification</Text>
          <View style={styles.otpContainer}>
            <Text style={styles.otpCode}>123456</Text>
          </View>
          
          <Text style={styles.sensitiveLabel}>User Credentials</Text>
          <Text style={styles.credentialText}>Email: user@example.com</Text>
          <Text style={styles.credentialText}>Password: ••••••••</Text>
          
          <Text style={styles.sensitiveLabel}>Payment Information</Text>
          <Text style={styles.credentialText}>Card: •••• •••• •••• 1234</Text>
          <Text style={styles.credentialText}>CVV: •••</Text>
        </View>
        
        <View style={styles.warningContainer}>
          <Ionicons name={isSecureMode ? "shield-checkmark" : "warning"} size={16} color={isSecureMode ? "#4CAF50" : "#FF6B6B"} />
          <Text style={styles.warningText}>
            {isSecureMode 
              ? "✅ This content would be protected from screenshots on real devices"
              : "⚠️ This sensitive content would be captured in screenshots!"
            }
          </Text>
        </View>
      </View>

      {/* Code Examples */}
      <View style={styles.codeCard}>
        <View style={styles.codeHeader}>
          <Text style={styles.cardTitle}>Implementation Code</Text>
          <TouchableOpacity 
            style={styles.showCodeButton}
            onPress={() => setShowCode(!showCode)}
          >
            <Ionicons 
              name={showCode ? "code-slash" : "code"} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.showCodeText}>
              {showCode ? "Hide Code" : "Show Code"}
            </Text>
          </TouchableOpacity>
        </View>

        {showCode && (
          <>
            {/* Platform Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, selectedCodeTab === 'android' && styles.activeTab]}
                onPress={() => setSelectedCodeTab('android')}
              >
                <Text style={[styles.tabText, selectedCodeTab === 'android' && styles.activeTabText]}>
                  Android (Java)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedCodeTab === 'ios' && styles.activeTab]}
                onPress={() => setSelectedCodeTab('ios')}
              >
                <Text style={[styles.tabText, selectedCodeTab === 'ios' && styles.activeTabText]}>
                  iOS (Swift)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedCodeTab === 'rn' && styles.activeTab]}
                onPress={() => setSelectedCodeTab('rn')}
              >
                <Text style={[styles.tabText, selectedCodeTab === 'rn' && styles.activeTabText]}>
                  React Native
                </Text>
              </TouchableOpacity>
            </View>

            {/* Code Type Toggle */}
            {selectedCodeTab !== 'rn' && (
              <View style={styles.codeTypeContainer}>
                <TouchableOpacity
                  style={[styles.codeTypeButton, codeType === 'secure' && styles.secureButton]}
                  onPress={() => setCodeType('secure')}
                >
                  <Ionicons name="shield-checkmark" size={14} color={codeType === 'secure' ? "#fff" : "#4CAF50"} />
                  <Text style={[styles.codeTypeText, codeType === 'secure' && styles.secureButtonText]}>
                    Secure
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.codeTypeButton, codeType === 'insecure' && styles.insecureButton]}
                  onPress={() => setCodeType('insecure')}
                >
                  <Ionicons name="warning" size={14} color={codeType === 'insecure' ? "#fff" : "#F44336"} />
                  <Text style={[styles.codeTypeText, codeType === 'insecure' && styles.insecureButtonText]}>
                    Insecure
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Code Display */}
            <View style={styles.codeWrapper}>
              <ScrollView style={styles.codeContainer} nestedScrollEnabled>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} nestedScrollEnabled>
                  <Text style={styles.codeText}>{getDisplayCode()}</Text>
                </ScrollView>
              </ScrollView>
            </View>
          </>
        )}
      </View>

      {/* Implementation Notes */}
      <View style={styles.notesCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name="information-circle" size={16} /> Implementation Notes
        </Text>
        
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>📱 How to test the protection:</Text>
          <Text style={styles.noteText}>
            1. Enable "FLAG_SECURE" toggle above{"\n"}
            2. Try taking screenshot now (using Cmd+S){"\n"}
            → Screenshot works (simulator limitation){"\n"}
            3. Press Home button to minimize app{"\n"}
            → Overlay appears! This is iOS protection{"\n"}
            4. Check recent apps - content is hidden!
          </Text>
        </View>
        
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>🔧 To enable real protection:</Text>
          <Text style={styles.noteText}>
            1. Run: expo install expo-screen-capture{"\n"}
            2. Use: preventScreenCaptureAsync(){"\n"}
            3. Create development build{"\n"}
            4. Test on physical device
          </Text>
        </View>
        
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>⚠️ Platform differences:</Text>
          <Text style={styles.noteText}>
            • Android: Native FLAG_SECURE support{"\n"}
            • iOS: Background protection + detection{"\n"}
            • React Native: expo-screen-capture wrapper{"\n"}
            • Web: Limited browser-dependent protection
          </Text>
        </View>
      </View>

      {/* OWASP Information */}
      <View style={styles.owaspCard}>
        <Text style={styles.cardTitle}>
          <Ionicons name="information-circle" size={16} /> OWASP Information
        </Text>
        
        <View style={styles.owaspInfo}>
          <Text style={styles.owaspLabel}>Category:</Text>
          <Text style={styles.owaspValue}>OWASP 2024 M8 - Security Misconfiguration</Text>
          
          <Text style={styles.owaspLabel}>Threat:</Text>
          <Text style={styles.owaspValue}>Sensitive data exposure through screenshots</Text>
          
          <Text style={styles.owaspLabel}>Impact:</Text>
          <Text style={styles.owaspValue}>Medium - Unauthorized access to sensitive information</Text>
          
          <Text style={styles.owaspLabel}>Mitigation:</Text>
          <Text style={styles.owaspValue}>Enable FLAG_SECURE for sensitive content</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Always enable FLAG_SECURE for screens containing sensitive information
        </Text>
      </View>
      </ScrollView>

      {/* Background Protection Overlay */}
      {showBackgroundOverlay && (
        <View style={styles.backgroundOverlay}>
          <View style={styles.overlayContent}>
            <Ionicons name="shield-checkmark" size={64} color="#4CAF50" />
            <Text style={styles.overlayTitle}>🔒 Protected</Text>
            <Text style={styles.overlaySubtitle}>
              This app is using FLAG_SECURE protection
            </Text>
            <Text style={styles.overlayDescription}>
              Sensitive content is hidden from:
            </Text>
            <View style={styles.overlayList}>
              <Text style={styles.overlayListItem}>• App switcher screenshots</Text>
              <Text style={styles.overlayListItem}>• Task manager previews</Text>
              <Text style={styles.overlayListItem}>• Third-party screenshot apps</Text>
              <Text style={styles.overlayListItem}>• Screen recording services</Text>
            </View>
            <Text style={styles.overlayHint}>
              This demonstrates iOS background protection
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  controlCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  switchContainer: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  controlDescription: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 16,
  },
  simulationCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simulationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  secureScreenshot: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    minHeight: 120,
    justifyContent: "center",
  },
  vulnerableScreenshot: {
    backgroundColor: "#ffe6e6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ff4444",
  },
  screenshotText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  screenshotSubtext: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  exposedLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 8,
  },
  exposedText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  screenshotWarning: {
    fontSize: 12,
    color: "#d32f2f",
    fontStyle: "italic",
    marginTop: 8,
  },
  simulateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  simulateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteSection: {
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  sensitiveCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensitiveContent: {
    marginBottom: 12,
  },
  sensitiveLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  otpContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  otpCode: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 8,
    color: "#007AFF",
  },
  credentialText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  warningText: {
    fontSize: 12,
    color: "#856404",
    marginLeft: 8,
    flex: 1,
  },
  codeCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  showCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  showCodeText: {
    color: "#007AFF",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  codeTypeContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  codeTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  secureButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  insecureButton: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  codeTypeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
    color: "#666",
  },
  secureButtonText: {
    color: "#fff",
  },
  insecureButtonText: {
    color: "#fff",
  },
  codeWrapper: {
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeContainer: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    minHeight: 300,
    maxHeight: 400,
  },
  codeText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#d4d4d4",
    lineHeight: 16,
  },
  owaspCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  owaspInfo: {
    marginTop: 8,
  },
  owaspLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 2,
  },
  owaspValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#2e7d32",
    textAlign: "center",
    fontWeight: "500",
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 32,
    backdropFilter: "blur(10px)",
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 16,
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  overlayDescription: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 12,
  },
  overlayList: {
    marginVertical: 12,
  },
  overlayListItem: {
    fontSize: 13,
    color: "#ddd",
    marginVertical: 4,
  },
  overlayHint: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 16,
    fontStyle: "italic",
  },
});