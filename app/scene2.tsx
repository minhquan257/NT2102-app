import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const StorageDemoScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [message, setMessage] = useState("");
  const [storedValue, setStoredValue] = useState("");
  const [showCode, setShowCode] = useState(false);
  const KEY = "user_password";

  // 🔐 / 🔓 Save
  const handleSave = async () => {
    if (!password) return;

    if (isSecureMode) {
      await SecureStore.setItemAsync(KEY, password);
      setMessage("🔐 Saved securely");
    } else {
      await AsyncStorage.setItem(KEY, password);
      setMessage("🔓 Saved in plaintext (vulnerable)");
    }

    setPassword("");
  };

  // 👀 Read (simulate attacker)
  const handleRead = async () => {
    let value;

    value = await AsyncStorage.getItem(KEY);

    setStoredValue(value || "No data");
  };

  // 📋 Copy
  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setMessage("📋 Copied!");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Storage Security Demo</Text>

      {/* SWITCH */}
      <View style={styles.switchContainer}>
        <Text style={styles.text}>
          {isSecureMode ? "🔐 Secure Mode" : "🔓 Insecure Mode"}
        </Text>
        <Switch value={isSecureMode} onValueChange={setIsSecureMode} />
      </View>

      {/* INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
      />

      {/* ACTIONS */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRead}>
        <Text style={styles.buttonText}>Read Storage</Text>
      </TouchableOpacity>
      <Text style={styles.result}>Stored Value: {storedValue}</Text>

      {/* SHOW CODE */}
      <TouchableOpacity
        style={styles.codeButton}
        onPress={() => setShowCode(!showCode)}
      >
        <Text style={styles.buttonText}>
          {showCode ? "Hide Code" : "Show Code"}
        </Text>
      </TouchableOpacity>

      {showCode && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeTitle}>🔓 Insecure</Text>
          <Text style={styles.codeBlock}>
            {`await AsyncStorage.setItem("user_password", password);`}
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleCopy(
                `await AsyncStorage.setItem("user_password", password);`,
              )
            }
          >
            <Text style={styles.copy}>Copy</Text>
          </TouchableOpacity>

          <Text style={styles.codeTitle}>🔐 Secure</Text>
          <Text style={styles.codeBlock}>
            {`await SecureStore.setItemAsync("user_password", password);`}
          </Text>
          <TouchableOpacity
            onPress={() =>
              handleCopy(
                `await SecureStore.setItemAsync("user_password", password);`,
              )
            }
          >
            <Text style={styles.copy}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}

      {message !== "" && <Text style={styles.message}>{message}</Text>}
    </ScrollView>
  );
};

export default StorageDemoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  result: {
    color: "#ccc",
    marginTop: 10,
  },
  codeButton: {
    marginTop: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  codeContainer: {
    marginTop: 15,
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 8,
  },
  codeTitle: {
    color: "#ffcc00",
    marginTop: 10,
  },
  codeBlock: {
    color: "#00ffcc",
    fontFamily: "monospace",
  },
  copy: {
    color: "#00ccff",
    marginTop: 5,
  },
  message: {
    marginTop: 10,
    color: "#fff",
  },
  attackButton: {
    backgroundColor: "#ff3333",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
});
