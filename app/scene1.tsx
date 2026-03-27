import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DisableRateLimitScreen() {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30000; // 30s
  const CORRECT_PIN = "1234";
  const [pin, setPin] = useState(["", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const inputs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const [isSecureMode, setIsSecureMode] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [showCode, setShowCode] = useState<boolean>(false);

  const handleToggleMode = (value: boolean) => {
    setIsSecureMode(value);

    // reset trạng thái
    setAttempts(0);
    setMessage("");
    setIsLocked(false);
    setPin(["", "", "", ""]);

    // focus lại ô đầu
    inputs.current[0]?.focus();
  };
  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    let newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Auto submit khi nhập đủ 4 số
    if (index === 3 && text) {
      handleSubmit(newPin.join(""));
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (enteredPin: string) => {
    // 🔐 Secure mode: check lock
    if (isSecureMode && isLocked) {
      setMessage("🚫 Too many attempts. Try again later.");
      return;
    }

    // 🔐 Secure mode: check attempts
    if (isSecureMode && attempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setMessage("🔒 Locked for 30 seconds");

      setTimeout(() => {
        setAttempts(0);
        setIsLocked(false);
        setMessage("");
      }, LOCK_TIME);

      return;
    }

    setAttempts((prev) => prev + 1);

    if (enteredPin === CORRECT_PIN) {
      setMessage("✅ Access Granted");
    } else {
      setMessage("❌ Wrong PIN");
    }

    setPin(["", "", "", ""]);
    inputs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Security Vulnerability</Text>

      {/* SWITCH */}
      <View style={styles.switchContainer}>
        <Text style={{ color: "#fff" }}>
          {isSecureMode ? "🔐 Secure Mode" : "🔓 Insecure Mode"}
        </Text>
        <Switch value={isSecureMode} onValueChange={handleToggleMode} />
      </View>

      <Text style={styles.description}>
        {isSecureMode
          ? "Attempts are limited. Too many failures will lock the app."
          : "Unlimited attempts allowed (vulnerable to brute-force)."}
      </Text>

      {/* PIN INPUT */}
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            secureTextEntry={true}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                handleBackspace(digit, index);
              }
            }}
          />
        ))}
      </View>

      {/* SUBMIT BUTTON (optional vì đã auto submit) */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSubmit(pin.join(""))}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <Text style={styles.attempts}>Attempts: {attempts}</Text>

      {message !== "" && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity
        style={styles.codeButton}
        onPress={() => setShowCode((prev) => !prev)}
      >
        <Text style={styles.buttonText}>
          {showCode ? "Hide Code" : "Show Code"}
        </Text>
        {showCode && (
          <ScrollView style={styles.codeContainer}>
            <Text style={styles.codeTitle}>🔓 Insecure Logic</Text>
            <Text style={styles.codeBlock}>
              {`// No rate limit
  setAttempts(prev => prev + 1);`}
            </Text>

            <Text style={styles.codeTitle}>🔐 Secure Logic</Text>
            <Text style={styles.codeBlock}>
              {`if (attempts >= 5) {
  setIsLocked(true);
  setTimeout(() => {
    setAttempts(0);
    setIsLocked(false);
  }, 30000);
}`}
            </Text>
          </ScrollView>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#5ba6b4",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ccc",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  description: {
    color: "#ccc",
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: "#333",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 12,
    backgroundColor: "#1e1e1e",
    color: "#fff",
  },
  button: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  attempts: {
    marginTop: 20,
    color: "#6deb79",
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  codeButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  codeContainer: {
    marginTop: 20,
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
  },

  codeTitle: {
    color: "#ffcc00",
    fontWeight: "bold",
    marginTop: 10,
  },

  codeBlock: {
    color: "#00ffcc",
    fontFamily: "monospace",
    marginTop: 5,
  },
});
