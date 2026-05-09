import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenCapture from "expo-screen-capture";
import React, { useRef, useState } from "react";
import {
    Alert,
    AppState,
    AppStateStatus,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

  type CodeTokenKind =
    | "plain"
    | "comment"
    | "string"
    | "keyword"
    | "number"
    | "function"
    | "operator";

  type CodeToken = {
    text: string;
    kind: CodeTokenKind;
  };

  const CODE_KEYWORDS = new Set([
    "import",
    "class",
    "public",
    "private",
    "func",
    "const",
    "let",
    "var",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "try",
    "catch",
    "true",
    "false",
    "null",
    "new",
  ]);

  const CODE_TOKEN_REGEX =
    /(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/=<>!&|?]+)/g;

  function findCommentStart(line: string): number {
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;

    for (let i = 0; i < line.length - 1; i += 1) {
      const ch = line[i];
      const next = line[i + 1];
      const prev = i > 0 ? line[i - 1] : "";

      if (ch === "'" && !inDouble && !inTemplate && prev !== "\\") {
        inSingle = !inSingle;
        continue;
      }
      if (ch === '"' && !inSingle && !inTemplate && prev !== "\\") {
        inDouble = !inDouble;
        continue;
      }
      if (ch === "`" && !inSingle && !inDouble && prev !== "\\") {
        inTemplate = !inTemplate;
        continue;
      }

      if (!inSingle && !inDouble && !inTemplate && ch === "/" && next === "/") {
        return i;
      }
    }

    return -1;
  }

  function tokenizeCodeChunk(chunk: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    const matches = chunk.matchAll(CODE_TOKEN_REGEX);
    let lastIndex = 0;

    for (const match of matches) {
      const text = match[0];
      const index = match.index ?? 0;

      if (index > lastIndex) {
        tokens.push({ text: chunk.slice(lastIndex, index), kind: "plain" });
      }

      let kind: CodeTokenKind = "plain";
      if (text.startsWith("\"") || text.startsWith("'") || text.startsWith("`")) {
        kind = "string";
      } else if (/^\d/.test(text)) {
        kind = "number";
      } else if (/^[A-Za-z_]\w*$/.test(text)) {
        if (CODE_KEYWORDS.has(text)) {
          kind = "keyword";
        } else {
          const remaining = chunk.slice(index + text.length);
          kind = /^\s*\(/.test(remaining) ? "function" : "plain";
        }
      } else {
        kind = "operator";
      }

      tokens.push({ text, kind });
      lastIndex = index + text.length;
    }

    if (lastIndex < chunk.length) {
      tokens.push({ text: chunk.slice(lastIndex), kind: "plain" });
    }

    return tokens;
  }

  function tokenizeCodeLine(line: string): CodeToken[] {
    const commentStart = findCommentStart(line);
    if (commentStart === -1) {
      return tokenizeCodeChunk(line);
    }

    return [
      ...tokenizeCodeChunk(line.slice(0, commentStart)),
      { text: line.slice(commentStart), kind: "comment" },
    ];
  }

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
      const secureTag = "flag-secure-demo";

      const applyCaptureProtection = async () => {
        try {
          if (isSecureMode) {
            await ScreenCapture.preventScreenCaptureAsync(secureTag);
          } else {
            await ScreenCapture.allowScreenCaptureAsync(secureTag);
          }
        } catch {
          // Ignore runtime errors in unsupported contexts.
        }
      };

      void applyCaptureProtection();

      // Hide overlay when screen is focused
      setShowBackgroundOverlay(false);

      return () => {
        void ScreenCapture.allowScreenCaptureAsync(secureTag).catch(() => {
          // Best-effort cleanup when leaving this screen.
        });
      };
    }, [isSecureMode])
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
        Platform.OS === "android"
          ? "FLAG_SECURE is enabled. On Android real devices, screenshots and recordings should now be blocked."
          : "Secure mode is enabled. iOS does not fully block hardware-button screenshots, but background/task-switcher leakage is still reduced.",
        [{ text: "Understood" }]
      );
    } else {
      Alert.alert(
        "⚠️ Insecure Mode Enabled", 
        "FLAG_SECURE is disabled. Sensitive content can now be captured by screenshot and screen recording.",
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

  const getCodeFileName = () => {
    if (selectedCodeTab === "android") {
      return codeType === "secure" ? "MainActivity.secure.java" : "MainActivity.insecure.java";
    }
    if (selectedCodeTab === "ios") {
      return codeType === "secure" ? "AppDelegate.secure.swift" : "AppDelegate.insecure.swift";
    }
    return "SecureScreen.rn.tsx";
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
          Toggle mode and compare behavior. Secure mode demonstrates protection,
          insecure mode demonstrates leakage risk.
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
              color="#9ecdf5" 
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
              <View style={styles.editorHeader}>
                <View style={styles.editorDots}>
                  <View style={[styles.editorDot, styles.editorDotRed]} />
                  <View style={[styles.editorDot, styles.editorDotYellow]} />
                  <View style={[styles.editorDot, styles.editorDotGreen]} />
                </View>
                <Text style={styles.editorTitle}>{getCodeFileName()}</Text>
              </View>

              <ScrollView style={styles.codeContainer} nestedScrollEnabled>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
                  <View style={styles.editorRow}>
                    <View style={styles.gutterCol}>
                      {getDisplayCode()
                        .split("\n")
                        .map((_, idx) => (
                          <Text key={`ln-${idx}`} style={styles.gutterText}>
                            {idx + 1}
                          </Text>
                        ))}
                    </View>

                    <View style={styles.codeCol}>
                      {getDisplayCode()
                        .split("\n")
                        .map((line, idx) => {
                          const tokens = tokenizeCodeLine(line || " ");
                          return (
                            <Text key={`line-${idx}`} style={styles.codeText}>
                              {tokens.map((token, tokenIdx) => (
                                <Text
                                  key={`token-${idx}-${tokenIdx}`}
                                  style={[
                                    styles.codeText,
                                    token.kind === "comment" && styles.codeComment,
                                    token.kind === "string" && styles.codeString,
                                    token.kind === "keyword" && styles.codeKeyword,
                                    token.kind === "number" && styles.codeNumber,
                                    token.kind === "function" && styles.codeFunction,
                                    token.kind === "operator" && styles.codeOperator,
                                  ]}
                                >
                                  {token.text}
                                </Text>
                              ))}
                            </Text>
                          );
                        })}
                    </View>
                  </View>
                </ScrollView>
              </ScrollView>
            </View>
          </>
        )}
      </View>

      <View style={styles.footerCompact}>
        <Text style={styles.footerCompactText}>
          OWASP M8: Secure configuration helps prevent screenshot data leaks.
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
            <TouchableOpacity
              style={styles.overlayCloseButton}
              onPress={() => setShowBackgroundOverlay(false)}
            >
              <View style={styles.overlayCloseButtonContent}>
                <Ionicons name="close-circle" size={18} color="#fff" />
                <Text style={styles.overlayCloseButtonText}>Close Demo Popup</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: "#0b1726",
  },
  header: {
    padding: 20,
    backgroundColor: "#12263f",
    borderBottomWidth: 1,
    borderBottomColor: "#255789",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d9f0ff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#98bbd6",
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#101f32",
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
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
    color: "#a8c0d6",
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
    color: "#bde2ff",
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  controlCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#101f32",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#263f5c",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e3f3ff",
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
    color: "#d6e6f5",
    fontWeight: "500",
  },
  controlDescription: {
    fontSize: 12,
    color: "#9ac7ea",
    fontStyle: "italic",
    lineHeight: 16,
  },
  simulationCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#101f32",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#263f5c",
  },
  simulationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#bde2ff",
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
    backgroundColor: "#391d2a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#b83d4b",
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
    color: "#ffd4da",
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
    backgroundColor: "#2a527a",
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
  codeCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#101f32",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#263f5c",
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2e4661",
  },
  showCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1a3553",
    borderRadius: 6,
  },
  showCodeText: {
    color: "#9ecdf5",
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
    backgroundColor: "#07111d",
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2e4661",
  },
  activeTab: {
    backgroundColor: "#225a86",
    borderColor: "#74b8ed",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a8c0d6",
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
    backgroundColor: "#07111d",
    borderWidth: 1,
    borderColor: "#2e4661",
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
    color: "#a8c0d6",
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
    borderWidth: 1,
    borderColor: "#2e4661",
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111d31",
    borderBottomWidth: 1,
    borderBottomColor: "#2e425d",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  editorDots: {
    flexDirection: "row",
    gap: 6,
  },
  editorDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  editorDotRed: {
    backgroundColor: "#ff5f56",
  },
  editorDotYellow: {
    backgroundColor: "#ffbd2e",
  },
  editorDotGreen: {
    backgroundColor: "#27c93f",
  },
  editorTitle: {
    color: "#9fb7d0",
    fontSize: 12,
    fontWeight: "700",
  },
  codeContainer: {
    backgroundColor: "#1e1e1e",
    minHeight: 220,
    maxHeight: 340,
  },
  editorRow: {
    flexDirection: "row",
    minWidth: "100%",
  },
  gutterCol: {
    backgroundColor: "#101a2d",
    borderRightWidth: 1,
    borderRightColor: "#2e425d",
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 42,
    alignItems: "flex-end",
  },
  gutterText: {
    color: "#5f7894",
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "monospace",
  },
  codeCol: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#0a1426",
  },
  codeText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#d4d4d4",
    lineHeight: 17,
  },
  codeComment: {
    color: "#6aa56a",
  },
  codeString: {
    color: "#e5c07b",
  },
  codeKeyword: {
    color: "#5ea2ff",
  },
  codeNumber: {
    color: "#d19a66",
  },
  codeFunction: {
    color: "#56b6c2",
  },
  codeOperator: {
    color: "#b8c7da",
  },
  footerCompact: {
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 2,
    padding: 12,
    backgroundColor: "#1a3553",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2e4661",
  },
  footerCompactText: {
    fontSize: 12,
    color: "#cde5ff",
    textAlign: "center",
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
    backgroundColor: "rgba(16, 31, 50, 0.95)",
    borderWidth: 1,
    borderColor: "#255789",
    borderRadius: 16,
    padding: 32,
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
    color: "#b7d0e8",
    marginBottom: 12,
  },
  overlayList: {
    marginVertical: 12,
  },
  overlayListItem: {
    fontSize: 13,
    color: "#d6e6f5",
    marginVertical: 4,
  },
  overlayCloseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: "#2a527a",
    borderWidth: 1,
    borderColor: "#74b8ed",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: "100%",
  },
  overlayCloseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  overlayCloseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  overlayHint: {
    fontSize: 12,
    color: "#98bbd6",
    marginTop: 16,
    fontStyle: "italic",
  },
});