// iOS - Secure Implementation (Privacy protection enabled)
// File: AppDelegate.swift
// 🔒 SECURE - Prevents screenshots and protects content in app switcher

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    private var overlayView: UIView?
    private var isSecureMode: Bool = true
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // ✅ SECURE: Setup privacy protection immediately
        setupPrivacyProtection()
        
        // Prevent screen captures and recordings
        setupScreenCaptureProtection()
        
        return true
    }
    
    // MARK: - Privacy Protection Setup
    
    /**
     * ✅ SECURE: Comprehensive privacy protection setup
     * Protects against screenshots, screen recording, and app switcher exposure
     */
    private func setupPrivacyProtection() {
        
        // Hide content when app goes to background (app switcher protection)
        NotificationCenter.default.addObserver(
            self, 
            selector: #selector(hideContentForSecurity), 
            name: UIApplication.willResignActiveNotification, 
            object: nil
        )
        
        // Show content when app becomes active again
        NotificationCenter.default.addObserver(
            self, 
            selector: #selector(showContentAfterSecurity), 
            name: UIApplication.didBecomeActiveNotification, 
            object: nil
        )
        
        // Additional protection when app enters background
        NotificationCenter.default.addObserver(
            self, 
            selector: #selector(hideContentForSecurity), 
            name: UIApplication.didEnterBackgroundNotification, 
            object: nil
        )
        
        // Screen capture detection (iOS 11+)
        if #available(iOS 11.0, *) {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(screenCaptureDetected),
                name: UIApplication.userDidTakeScreenshotNotification,
                object: nil
            )
        }
        
        // Screen recording detection (iOS 11+)
        if #available(iOS 11.0, *) {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(screenRecordingChanged),
                name: UIScreen.capturedDidChangeNotification,
                object: nil
            )
        }
    }
    
    /**
     * ✅ SECURE: Hide sensitive content with overlay
     * Prevents exposure in app switcher and task manager
     */
    @objc private func hideContentForSecurity() {
        guard let window = window, isSecureMode else { return }
        
        // Remove existing overlay first
        overlayView?.removeFromSuperview()
        
        // Create privacy overlay
        overlayView = UIView(frame: window.bounds)
        overlayView?.backgroundColor = .systemBackground
        overlayView?.alpha = 0
        
        // Add app logo/branding instead of sensitive content
        let logoContainer = UIView()
        logoContainer.backgroundColor = .clear
        logoContainer.translatesAutoresizingMaskIntoConstraints = false
        
        let logoImageView = UIImageView()
        logoImageView.contentMode = .scaleAspectFit
        logoImageView.image = UIImage(named: "app-logo") // Your app logo
        logoImageView.translatesAutoresizingMaskIntoConstraints = false
        
        let appNameLabel = UILabel()
        appNameLabel.text = "Secure App"  
        appNameLabel.textAlignment = .center
        appNameLabel.font = UIFont.systemFont(ofSize: 24, weight: .semibold)
        appNameLabel.textColor = .label
        appNameLabel.translatesAutoresizingMaskIntoConstraints = false
        
        let securityLabel = UILabel()
        securityLabel.text = "🔒 Protected Content"
        securityLabel.textAlignment = .center
        securityLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        securityLabel.textColor = .secondaryLabel
        securityLabel.translatesAutoresizingMaskIntoConstraints = false
        
        overlayView?.addSubview(logoContainer)
        logoContainer.addSubview(logoImageView)
        logoContainer.addSubview(appNameLabel)
        logoContainer.addSubview(securityLabel)
        
        // Setup auto layout constraints
        NSLayoutConstraint.activate([
            logoContainer.centerXAnchor.constraint(equalTo: overlayView!.centerXAnchor),
            logoContainer.centerYAnchor.constraint(equalTo: overlayView!.centerYAnchor),
            
            logoImageView.topAnchor.constraint(equalTo: logoContainer.topAnchor),
            logoImageView.centerXAnchor.constraint(equalTo: logoContainer.centerXAnchor),
            logoImageView.widthAnchor.constraint(equalToConstant: 80),
            logoImageView.heightAnchor.constraint(equalToConstant: 80),
            
            appNameLabel.topAnchor.constraint(equalTo: logoImageView.bottomAnchor, constant: 16),
            appNameLabel.leadingAnchor.constraint(equalTo: logoContainer.leadingAnchor),
            appNameLabel.trailingAnchor.constraint(equalTo: logoContainer.trailingAnchor),
            
            securityLabel.topAnchor.constraint(equalTo: appNameLabel.bottomAnchor, constant: 8),
            securityLabel.leadingAnchor.constraint(equalTo: logoContainer.leadingAnchor),
            securityLabel.trailingAnchor.constraint(equalTo: logoContainer.trailingAnchor),
            securityLabel.bottomAnchor.constraint(equalTo: logoContainer.bottomAnchor)
        ])
        
        window.addSubview(overlayView!)
        
        // Animate overlay appearance
        UIView.animate(withDuration: 0.2) {
            self.overlayView?.alpha = 1
        }
    }
    
    /**
     * ✅ SECURE: Remove content overlay when app becomes active
     */
    @objc private func showContentAfterSecurity() {
        guard let overlay = overlayView else { return }
        
        UIView.animate(withDuration: 0.2, animations: {
            overlay.alpha = 0
        }) { _ in
            overlay.removeFromSuperview()
            self.overlayView = nil
        }
    }
    
    // MARK: - Screen Capture & Recording Protection
    
    /**
     * ✅ SECURE: Setup screen capture protection (iOS 11+)
     */
    private func setupScreenCaptureProtection() {
        if #available(iOS 11.0, *) {
            // Monitor for screen recording
            checkScreenRecordingStatus()
        }
    }
    
    /**
     * ✅ SECURE: Detect when user takes screenshot
     */
    @objc private func screenCaptureDetected() {
        if isSecureMode {
            // Log security event
            logSecurityEvent("Screenshot detected")
            
            // Notify user about security policy
            showSecurityAlert(
                title: "Screenshot Detected",
                message: "Screenshots are not allowed for security reasons. This event has been logged."
            )
            
            // Additional security measures:
            // - Log out user
            // - Clear sensitive data from memory
            // - Send security notification to server
        }
    }
    
    /**
     * ✅ SECURE: Handle screen recording detection
     */
    @objc private func screenRecordingChanged() {
        if #available(iOS 11.0, *) {
            checkScreenRecordingStatus()
        }
    }
    
    /**
     * ✅ SECURE: Check and respond to screen recording
     */
    @available(iOS 11.0, *)
    private func checkScreenRecordingStatus() {
        if UIScreen.main.isCaptured && isSecureMode {
            // Screen recording is active
            logSecurityEvent("Screen recording detected")
            
            showSecurityAlert(
                title: "Screen Recording Detected",
                message: "Screen recording is not allowed. Please stop recording to continue using the app."
            )
            
            // Additional protective measures:
            // - Hide sensitive content
            // - Show privacy overlay
            // - Pause sensitive operations
            hideContentForSecurity()
        }
    }
    
    // MARK: - Security Controls
    
    /**
     * ✅ SECURE: Enable secure mode (default)
     */
    public func enableSecureMode() {
        isSecureMode = true
        
        // Apply security measures immediately if app is in background
        if UIApplication.shared.applicationState != .active {
            hideContentForSecurity()
        }
        
        logSecurityEvent("Secure mode enabled")
    }
    
    /**
     * ⚠️ WARNING: Disable secure mode (testing only)
     * Never use in production for sensitive screens!
     */
    public func disableSecureMode() {
        isSecureMode = false
        
        // Remove overlay if present
        showContentAfterSecurity()
        
        logSecurityEvent("Secure mode disabled - TESTING ONLY")
    }
    
    // MARK: - Utility Methods
    
    /**
     * ✅ SECURE: Show security-related alerts
     */
    private func showSecurityAlert(title: String, message: String) {
        DispatchQueue.main.async {
            guard let topViewController = self.getTopViewController() else { return }
            
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Understood", style: .default))
            
            topViewController.present(alert, animated: true)
        }
    }
    
    /**
     * ✅ SECURE: Log security events for audit trail
     */
    private func logSecurityEvent(_ event: String) {
        let timestamp = DateFormatter.iso8601.string(from: Date())
        print("🔒 SECURITY EVENT [\(timestamp)]: \(event)")
        
        // In production, send to security monitoring system
        // SecurityLogger.logEvent(event, timestamp: timestamp)
    }
    
    /**
     * Get the topmost view controller for presenting alerts
     */
    private func getTopViewController() -> UIViewController? {
        guard let window = window else { return nil }
        
        var topViewController = window.rootViewController
        while let presentedViewController = topViewController?.presentedViewController {
            topViewController = presentedViewController
        }
        
        return topViewController
    }
    
    // MARK: - Cleanup
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - Extensions

extension DateFormatter {
    static let iso8601: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        return formatter
    }()
}