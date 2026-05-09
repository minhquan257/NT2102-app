// Android - Insecure Implementation (FLAG_SECURE disabled) 
// File: MainActivity.java
// ⚠️ VULNERABLE - Screenshots and screen recording are allowed!

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ⚠️ SECURITY VULNERABILITY: FLAG_SECURE not set!
        // Screenshots and screen recording are allowed on ALL screens
        // Sensitive data can be captured by:
        // - Malicious apps with screenshot permissions
        // - Users taking accidental screenshots
        // - Screen recording malware
        // - Social engineering attacks
        
        setContentView(R.layout.activity_main);
        
        // No security protection implemented
        showVulnerableContent();
    }
    
    /**
     * ⚠️ VULNERABLE: This method displays sensitive information without protection
     * Any content shown here can be captured via screenshots or screen recording
     */
    private void showVulnerableContent() {
        // The following sensitive data is NOT protected:
        
        // 1. OTP/PIN verification screens
        displayOtpScreen();
        
        // 2. Login credentials  
        displayLoginScreen();
        
        // 3. Personal information
        displayPersonalInfo();
        
        // 4. Financial data
        displayBankingInfo();
        
        // 5. Medical records
        displayHealthData();
        
        // 6. Business confidential information
        displayCorporateData();
    }
    
    /**
     * ⚠️ VULNERABLE: OTP screen without FLAG_SECURE protection
     * Attackers can screenshot the OTP code for unauthorized access
     */
    private void displayOtpScreen() {
        // OTP: 123456 - This can be screenshot!
        // SMS verification codes
        // Email verification tokens
        // Two-factor authentication codes
    }
    
    /**
     * ⚠️ VULNERABLE: Login screen without protection
     * User credentials can be captured during login
     */
    private void displayLoginScreen() {
        // Username: user@example.com - Visible in screenshots!
        // Password: mySecretPassword123! - Can be captured!
        // Remember me checkbox state
        // Biometric authentication prompts
    }
    
    /**
     * ⚠️ VULNERABLE: Personal data without protection
     * PII (Personally Identifiable Information) exposure risk
     */
    private void displayPersonalInfo() {
        // Full Name: John Doe - Can be screenshot
        // SSN: 123-45-6789 - Identity theft risk!
        // Date of Birth: 01/01/1990
        // Address: 123 Main St, City, State
        // Phone: +1-555-123-4567
        // Email: personal@email.com
    }
    
    /**
     * ⚠️ VULNERABLE: Financial data exposure
     * Critical financial information can be captured
     */
    private void displayBankingInfo() {
        // Account Number: 1234567890 - Banking fraud risk!
        // Routing Number: 021000021
        // Credit Card: 4532 1234 5678 9012
        // CVV: 123 - Payment fraud risk!
        // Balance: $50,000.00
        // Transaction history
    }
    
    /**
     * ⚠️ VULNERABLE: Medical data without HIPAA protection
     * Health information privacy violations
     */
    private void displayHealthData() {
        // Medical ID: MED123456
        // Diagnosis: Sensitive medical condition
        // Medications: List of prescriptions
        // Insurance Info: Policy numbers
        // Doctor notes and treatment plans
    }
    
    /**
     * ⚠️ VULNERABLE: Business confidential data
     * Corporate espionage and data breach risks  
     */
    private void displayCorporateData() {
        // API Keys: sk_live_abc123... - Can compromise entire system!
        // Database credentials
        // Internal business strategies
        // Customer lists and contacts
        // Financial projections
        // Trade secrets
    }
    
    /**
     * ⚠️ VULNERABLE: No background protection
     * App content remains visible in task switcher
     */
    @Override
    protected void onPause() {
        super.onPause();
        
        // No overlay or content hiding implemented
        // App preview in recent apps shows actual sensitive content
        // Task switcher screenshots can be accessed by malicious apps
    }
    
    /**
     * ⚠️ VULNERABLE: No secure mode toggle
     * Even if the app wanted to be secure, no mechanism exists
     */
    public void attemptToEnableSecureMode() {
        // This method does nothing because security was not implemented
        // FLAG_SECURE should have been set in onCreate() or onResume()
        
        // What should have been done:
        // getWindow().setFlags(
        //     WindowManager.LayoutParams.FLAG_SECURE,
        //     WindowManager.LayoutParams.FLAG_SECURE
        // );
    }
}

/*
 * OWASP Mobile Top 10 - 2024 
 * M8: Security Misconfiguration
 * 
 * This vulnerable implementation demonstrates:
 * 
 * 1. Lack of FLAG_SECURE protection
 * 2. Sensitive data exposure through screenshots
 * 3. No background content hiding
 * 4. Missing security controls
 * 5. Inadequate data protection measures
 * 
 * Potential Attack Vectors:
 * - Social engineering (screenshot sharing)
 * - Malware with screenshot permissions
 * - Physical device access
 * - Screen recording malware
 * - Task switcher content exposure
 * - Shoulder surfing with photo evidence
 * 
 * Business Impact:
 * - Identity theft
 * - Financial fraud  
 * - Medical privacy violations
 * - Corporate espionage
 * - Regulatory compliance failures
 * - Customer trust loss
 * - Legal liability
 */