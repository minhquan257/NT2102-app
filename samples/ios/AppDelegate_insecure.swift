// iOS - Insecure Implementation (No privacy protection)
// File: AppDelegate.swift  
// ⚠️ VULNERABLE - Screenshots allowed and content exposed in app switcher

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // ⚠️ SECURITY VULNERABILITY: No privacy protection implemented!
        // Screenshots and screen recordings are freely allowed
        // Sensitive content will be visible in:
        // - Screenshots taken by users or malicious apps
        // - Screen recordings
        // - App switcher/task manager previews
        // - Share sheet previews
        // - iOS Screen Time reports
        
        return true
    }
    
    // MARK: - Vulnerable Application Lifecycle
    
    /**
     * ⚠️ VULNERABLE: No background protection
     * App content remains fully visible when backgrounded
     */
    func applicationWillResignActive(_ application: UIApplication) {
        // No overlay or content hiding implemented
        // Sensitive data remains visible when:
        // - User switches to another app
        // - Control Center is pulled down
        // - Notification banners appear
        // - Phone calls are received
        // - Siri is activated
        
        // What should be here but ISN'T:
        // addPrivacyOverlay()
        // hideSensitiveContent()
        // clearSensitiveDataFromMemory()
    }
    
    /**
     * ⚠️ VULNERABLE: App enters background with exposed content
     * Task switcher will show actual sensitive content
     */
    func applicationDidEnterBackground(_ application: UIApplication) {
        // No security measures implemented
        // App preview in task switcher shows real content including:
        displayVulnerableContentInTaskSwitcher()
    }
    
    /**
     * ⚠️ VULNERABLE: Content exposed in app switcher
     * Malicious apps can access task switcher screenshots
     */
    private func displayVulnerableContentInTaskSwitcher() {
        // The following sensitive content will be visible in task switcher:
        
        // 1. Login screens with usernames
        // 2. Password input fields (if visible)
        // 3. OTP/PIN verification screens
        // 4. Personal information displays
        // 5. Financial account details  
        // 6. Health records
        // 7. Business confidential data
        // 8. Chat conversations
        // 9. Email content
        // 10. Photo galleries
        
        // These are all exposed to:
        // - Other apps with screenshot permissions
        // - Malware that can access task switcher
        // - Physical device access
        // - Shoulder surfing attacks
    }
    
    /**
     * ⚠️ VULNERABLE: No screen capture detection
     * App doesn't know when screenshots are taken
     */
    func applicationDidBecomeActive(_ application: UIApplication) {
        // No screenshot or screen recording detection
        // Missing crucial security monitoring:
        
        // Should have implemented:
        // - Screenshot detection notifications
        // - Screen recording status monitoring  
        // - Security event logging
        // - User notification about captures
        // - Automatic logout on security violations
        // - Server-side security alerts
    }
    
    // MARK: - Missing Security Features
    
    /**
     * ⚠️ VULNERABLE: No screenshot detection
     * This method should exist but doesn't!
     */
    private func handleScreenshotDetection() {
        // NOT IMPLEMENTED - Critical security gap!
        
        // Should detect and respond to:
        // - UIApplication.userDidTakeScreenshotNotification
        // - Log security events
        // - Alert user about policy violations
        // - Take protective actions (logout, etc.)
        // - Notify security team
    }
    
    /**
     * ⚠️ VULNERABLE: No screen recording detection  
     * App allows unrestricted screen recording
     */
    private func handleScreenRecordingDetection() {
        // NOT IMPLEMENTED - Critical security gap!
        
        // Should monitor:
        // - UIScreen.main.isCaptured property
        // - UIScreen.capturedDidChangeNotification
        // - Respond with content hiding
        // - Force app logout during recording
        // - Display security warnings
    }
    
    /**
     * ⚠️ VULNERABLE: No privacy overlay system
     * Sensitive content always visible during app transitions
     */
    private func addPrivacyOverlay() {
        // NOT IMPLEMENTED - Critical security gap!
        
        // Should provide:
        // - Immediate content hiding when app backgrounds
        // - Branded overlay instead of sensitive content
        // - Smooth transitions to maintain user experience
        // - Customizable overlay based on content sensitivity
    }
    
    // MARK: - Exposed Sensitive Content Examples
    
    /**
     * ⚠️ VULNERABLE: Authentication screens without protection
     */
    private func exposeAuthenticationScreens() {
        // Login credentials visible in screenshots:
        // Username: john.doe@company.com
        // Password: MyVerySecretPassword123!
        // Remember Me: Checked
        // Biometric authentication states
        // Two-factor authentication codes
        // Security questions and answers
    }
    
    /**
     * ⚠️ VULNERABLE: Financial data without protection
     */
    private func exposeFinancialData() {
        // Banking information visible in screenshots:
        // Account Balance: $125,430.50
        // Account Number: 1234567890123456  
        // Routing Number: 021000021
        // Credit Card Numbers: 4532 1234 5678 9012
        // CVV Codes: 123
        // Transaction History with amounts and merchants
        // Investment portfolio values
        // Cryptocurrency wallet addresses and balances
    }
    
    /**
     * ⚠️ VULNERABLE: Personal information exposure
     */
    private func exposePersonalInformation() {
        // PII visible in screenshots and recordings:
        // Full Name: John Alexander Doe
        // Social Security Number: 123-45-6789
        // Date of Birth: January 15, 1985
        // Home Address: 123 Privacy Lane, Secure City, ST 12345
        // Phone Numbers: +1-555-123-4567
        // Email Addresses: personal@email.com, work@company.com
        // Driver's License: DL123456789
        // Passport Number: US123456789
    }
    
    /**
     * ⚠️ VULNERABLE: Health information without HIPAA protection
     */
    private func exposeHealthInformation() {
        // Medical data visible in screenshots:
        // Patient ID: MED-789123456
        // Medical Conditions: Hypertension, Diabetes Type 2
        // Current Medications: Metformin 500mg, Lisinopril 10mg
        // Allergies: Penicillin, Sulfa drugs
        // Insurance Information: Policy ABC123456789
        // Doctor Names and Contact Information
        // Appointment Schedules and Medical Notes
        // Lab Results and Test Values
    }
    
    /**
     * ⚠️ VULNERABLE: Business confidential data exposure
     */
    private func exposeBusinessData() {
        // Corporate secrets visible in screenshots:
        // API Keys: sk_live_abc123def456ghi789...
        // Database Connection Strings with passwords
        // Internal Email Communications
        // Financial Projections and Business Plans
        // Customer Lists and Contact Information
        // Proprietary Algorithms and Code
        // Merger and Acquisition Information
        // Employee Salary and HR Data
        // Trade Secrets and Patent Information
    }
    
    /**
     * ⚠️ VULNERABLE: Communication content exposure
     */
    private func exposeCommunicationContent() {
        // Private communications visible in screenshots:
        // Text Messages with personal conversations
        // Email Content including attachments
        // Voice Message Transcriptions
        // Video Call Screenshots
        // Social Media Direct Messages
        // Business Slack/Teams Conversations
        // Legal Document Discussions
        // Confidential Attorney-Client Communications
    }
}

/*
 * OWASP Mobile Top 10 - 2024
 * M8: Security Misconfiguration  
 * 
 * This vulnerable iOS implementation demonstrates critical security gaps:
 * 
 * MISSING PROTECTIONS:
 * ❌ No background content hiding
 * ❌ No screenshot detection
 * ❌ No screen recording monitoring
 * ❌ No privacy overlay system
 * ❌ No security event logging
 * ❌ No content protection during app transitions
 * ❌ No compliance with data protection regulations
 * 
 * ATTACK VECTORS:
 * 🎯 Screenshot attacks (malicious apps or social engineering)
 * 🎯 Screen recording malware
 * 🎯 Task switcher content exposure
 * 🎯 Physical device shoulder surfing with photo evidence
 * 🎯 Share sheet content leakage
 * 🎯 iOS Screen Time report data mining
 * 🎯 iCloud screenshot sync exposing data across devices
 * 🎯 AirDrop accidental screenshot sharing
 * 🎯 Third-party keyboard screenshot capabilities
 * 🎯 Accessibility service screenshot access
 * 
 * BUSINESS IMPACT:
 * 💰 Identity theft and financial fraud
 * 📋 HIPAA/GDPR/CCPA compliance violations
 * 🏢 Corporate espionage and intellectual property theft
 * ⚖️ Legal liability and regulatory fines
 * 🤝 Customer trust loss and reputation damage
 * 📊 Competitive disadvantage from data leaks
 * 💸 Financial losses from security breaches
 * 🔐 Complete compromise of user privacy
 * 
 * REGULATORY VIOLATIONS:
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - GDPR (General Data Protection Regulation)  
 * - CCPA (California Consumer Privacy Act)
 * - PCI DSS (Payment Card Industry Data Security Standard)
 * - SOX (Sarbanes-Oxley Act) for financial data
 * - FERPA (Family Educational Rights and Privacy Act)
 * - GLBA (Gramm-Leach-Bliley Act) for financial institutions
 * 
 * FIX REQUIRED:
 * Implement comprehensive privacy protection as shown in AppDelegate_secure.swift
 */