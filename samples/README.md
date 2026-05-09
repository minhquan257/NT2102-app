# FLAG_SECURE Security Demonstration

This demo app showcases the **MISCONF_FLAG_SECURE_OFF** vulnerability, which is part of **OWASP Mobile Top 10 2024 - M8: Security Misconfiguration**.

## 🔒 Overview

FLAG_SECURE is a critical security feature that prevents screenshots and screen recording on sensitive screens. When disabled or misconfigured, it allows unauthorized capture of sensitive information like:

- 🔢 OTP/PIN codes
- 🔑 Passwords and login credentials
- 💳 Financial information (credit cards, bank accounts)
- 🏥 Medical records (HIPAA protected data)
- 📄 Personal identifiable information (PII)
- 🏢 Business confidential data

## 📱 Demo Features

### Interactive Screen (`/app/flag-secure.tsx`)
- **Security Toggle**: Switch between secure and insecure modes
- **Live Status**: Real-time security status indicator
- **Sensitive Content**: Simulated OTP, credentials, and payment info
- **Code Viewer**: Native Android, iOS, and React Native implementations
- **OWASP Information**: Detailed vulnerability classification

### Code Examples (`/samples/`)
- **Android Secure** (`android/MainActivity_secure.java`)
- **Android Vulnerable** (`android/MainActivity_insecure.java`)
- **iOS Secure** (`ios/AppDelegate_secure.swift`)
- **iOS Vulnerable** (`ios/AppDelegate_insecure.swift`)
- **React Native** (`ReactNative_implementation.tsx`)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- React Native development environment

### Installation
```bash
# Clone and install dependencies
npm install

# Start the development server
npm run start

# Run on specific platforms
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Navigation
1. Open the app
2. Access the drawer menu (hamburger icon)
3. Select "FLAG_SECURE Demo"
4. Toggle security modes and explore code examples

## 🛡️ Security Implementation Guide

### Android Implementation

#### ✅ Secure (FLAG_SECURE Enabled)
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Enable FLAG_SECURE to prevent screenshots
    getWindow().setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    );
    
    setContentView(R.layout.activity_main);
}
```

#### ⚠️ Vulnerable (FLAG_SECURE Disabled)
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // VULNERABILITY: No FLAG_SECURE protection
    // Screenshots and recordings are allowed!
    
    setContentView(R.layout.activity_main);
}
```

### iOS Implementation

#### ✅ Secure (Privacy Protection)
```swift
// Hide content when app goes to background
NotificationCenter.default.addObserver(
    self, 
    selector: #selector(hideContent), 
    name: UIApplication.willResignActiveNotification, 
    object: nil
)

@objc private func hideContent() {
    // Add privacy overlay to hide sensitive content
    let overlayView = UIView(frame: window.bounds)
    overlayView.backgroundColor = .black
    window.addSubview(overlayView)
}
```

#### ⚠️ Vulnerable (No Protection)
```swift
// VULNERABILITY: No background protection implemented
func applicationWillResignActive(_ application: UIApplication) {
    // Sensitive content remains visible in app switcher!
}
```

### React Native Implementation

#### ✅ Secure (expo-screen-capture)
```typescript
import { preventScreenCaptureAsync } from 'expo-screen-capture';

useEffect(() => {
    // Enable screenshot protection
    preventScreenCaptureAsync();
    
    return () => {
        // Cleanup on unmount
        allowScreenCaptureAsync();
    };
}, []);
```

## 🎯 Testing the Demo

### Secure Mode Testing
1. Enable "FLAG_SECURE" toggle
2. Try to take a screenshot
3. **Expected**: Screenshot should be blocked or show black screen
4. **Actual Result**: Depends on platform and implementation

### Insecure Mode Testing  
1. Disable "FLAG_SECURE" toggle
2. Try to take a screenshot
3. **Expected**: Screenshot should capture sensitive content
4. **Risk**: Sensitive information exposed

### Code Exploration
1. Click "Show Code" button
2. Switch between Android/iOS/React Native tabs
3. Toggle between Secure/Insecure implementations
4. Compare the differences in security measures

## 🚨 Security Risk Assessment

### Risk Level: **MEDIUM** 
- **Likelihood**: Common (easy to miss during development)
- **Impact**: Medium (sensitive data exposure)
- **Exploitability**: Easy (simple screenshot/recording)

### Attack Vectors
- 📱 Malicious apps with screenshot permissions
- 👥 Social engineering (screenshot sharing)
- 🕵️ Shoulder surfing with photo evidence  
- 🎥 Screen recording malware
- 🔄 App switcher content exposure
- 📤 Accidental sharing through screenshots

### Business Impact
- 💰 Financial fraud (exposed credit cards, bank info)
- 🆔 Identity theft (SSN, personal info)
- ⚖️ Regulatory violations (HIPAA, GDPR, PCI DSS)
- 🏢 Corporate espionage (trade secrets, API keys)
- 🤝 Customer trust loss
- 📊 Competitive disadvantage

## 📋 OWASP Classification

**Category**: OWASP Mobile Top 10 2024 - M8: Security Misconfiguration

**Description**: FLAG_SECURE disabled for sensitive screens allows screenshots of confidential information.

**Common Weakness Enumeration (CWE)**:
- CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
- CWE-359: Exposure of Private Personal Information to an Unauthorized Actor  

## 🔧 Mitigation Strategies

### 1. Enable FLAG_SECURE (Android)
```java
getWindow().setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
);
```

### 2. Background Content Protection (iOS)
- Implement app state observers
- Add privacy overlay when backgrounded
- Hide sensitive content in app switcher

### 3. Screen Capture Detection
- Monitor screenshot notifications
- Detect screen recording states
- Log security events
- Notify users of violations

### 4. Additional Security Measures
- Implement automatic logout on screenshot
- Clear sensitive data from memory
- Use time-based content expiration
- Add watermarks to sensitive content
- Implement server-side security monitoring

## 📱 Platform-Specific Considerations

### Android
- FLAG_SECURE works on most devices
- Some custom ROMs may bypass protection
- Test on various device manufacturers
- Consider DRM-protected content for high security

### iOS  
- No direct FLAG_SECURE equivalent
- App backgrounding protection required
- Screenshot detection available iOS 11+
- Screen recording detection available iOS 11+

### React Native/Expo
- Limited cross-platform options
- expo-screen-capture provides basic protection
- Requires development build (not Expo Go)
- Web platform has limited capabilities

## 🧪 Testing Checklist

### Manual Testing
- [ ] Screenshot attempt in secure mode
- [ ] Screenshot attempt in insecure mode
- [ ] Screen recording in both modes
- [ ] App switcher content visibility
- [ ] Background/foreground transitions
- [ ] Notification overlay interactions

### Automated Testing
- [ ] Unit tests for security state management
- [ ] Integration tests for screen protection
- [ ] Security event logging verification
- [ ] Screenshot detection accuracy
- [ ] Error handling for unsupported devices

## 🚀 Production Deployment

### Security Checklist
- [ ] FLAG_SECURE enabled for all sensitive screens
- [ ] Background content protection implemented
- [ ] Screenshot/recording detection configured  
- [ ] Security event logging enabled
- [ ] User notification system active
- [ ] Compliance requirements verified (HIPAA/GDPR/PCI)

### Performance Considerations
- [ ] Overlay animation performance
- [ ] Memory usage optimization
- [ ] Battery impact assessment
- [ ] User experience impact evaluation

## 🆘 Emergency Response

If sensitive data exposure is discovered:

1. **Immediate**: Audit affected screens and enable FLAG_SECURE
2. **Short-term**: Implement detection and logging
3. **Long-term**: Review all app screens for sensitive content
4. **Monitor**: Set up alerting for security violations
5. **Compliance**: Report to appropriate authorities if required

## 📚 Resources

### Documentation
- [Android WindowManager.LayoutParams](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#FLAG_SECURE)
- [iOS App State Management](https://developer.apple.com/documentation/uikit/app_and_environment/managing_your_app_s_life_cycle)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)
- [expo-screen-capture](https://docs.expo.dev/versions/latest/sdk/screen-capture/)

### Security Standards
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/documents/PCI_DSS_v3-2-1.pdf)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

---

**⚠️ Disclaimer**: This is a demonstration app for educational purposes. Always implement proper security measures in production applications handling sensitive data.