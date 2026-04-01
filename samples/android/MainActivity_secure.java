// Android - Secure Implementation (FLAG_SECURE enabled)
// File: MainActivity.java
// 🔒 SECURE - Prevents screenshots and screen recording

import android.os.Bundle;
import android.view.WindowManager;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

public class MainActivity extends AppCompatActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ✅ SECURE: Enable FLAG_SECURE to prevent screenshots and screen recording
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
        
        setContentView(R.layout.activity_main);
        
        // Enable secure mode for all fragments by default
        enableSecureModeForFragments();
    }
    
    /**
     * Enable FLAG_SECURE for sensitive screens
     * This should be called for any activity/fragment that displays:
     * - OTP/PIN entry screens
     * - Password input fields  
     * - Personal/financial information
     * - Medical records
     * - Any confidential data
     */
    private void enableSecureMode() {
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
    
    /**
     * Disable FLAG_SECURE (ONLY for testing/debugging purposes)
     * ⚠️ WARNING: Never use this in production for sensitive screens!
     */
    private void disableSecureMode() {
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
    
    /**
     * Apply secure settings to all fragments
     */
    private void enableSecureModeForFragments() {
        FragmentManager fragmentManager = getSupportFragmentManager();
        fragmentManager.addOnBackStackChangedListener(() -> {
            Fragment currentFragment = fragmentManager.findFragmentById(R.id.fragment_container);
            if (currentFragment instanceof SensitiveFragment) {
                enableSecureMode();
            }
        });
    }
    
    /**
     * Example: Conditionally enable FLAG_SECURE based on screen content
     */
    public void showSensitiveContent(boolean isSensitive) {
        if (isSensitive) {
            // Enable protection for sensitive content
            enableSecureMode();
        } else {
            // For non-sensitive screens, you may choose to disable protection
            // However, it's generally safer to keep it enabled
            // disableSecureMode(); // Use with caution
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        
        // Ensure FLAG_SECURE is always enabled when app resumes
        enableSecureMode();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        
        // Keep FLAG_SECURE enabled even when paused for maximum security
        enableSecureMode();
    }
}

// Example of a sensitive fragment that requires FLAG_SECURE protection
class SensitiveFragment extends Fragment {
    
    @Override
    public void onResume() {
        super.onResume();
        
        // Ensure parent activity has FLAG_SECURE enabled
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).enableSecureMode();
        }
    }
}