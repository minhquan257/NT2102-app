import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PiiLoggingScreen: React.FC = () => {
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [email, setEmail] = useState("user@gmail.com");
  const [password, setPassword] = useState("123456");
  const [logs, setLogs] = useState<string[]>([]);
  const [attackResult, setAttackResult] = useState("");
  const [showCode, setShowCode] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setLogs([]);
      setAttackResult("");
    }, []),
  );

  // 📝 Log function
  const addLog = (log: string) => {
    setLogs((prev) => [log, ...prev]);
  };

  // 🔓 / 🔐 Simulate login
  const handleLogin = () => {
    if (!isSecureMode) {
      addLog(`[INSECURE] Login email=${email} password=${password}`);
    }
  };

  // 🔍 Simulate attacker đọc log
  //   const handleAttack = () => {
  //     const leaked = logs.find((log) => log.includes("password="));

  //     if (!leaked) {
  //       setAttackResult("No sensitive data found");
  //       return;
  //     }

  //     if (isSecureMode) {
  //       setAttackResult(
  //         `❌ Attack failed\n> Logs are masked\n> No plaintext password exposed`,
  //       );
  //     } else {
  //       setAttackResult(`🚨 Attack success!\n> Extracted log:\n${leaked}`);
  //     }
  //   };

  // 📋 Copy logs
  const handleCopy = async () => {
    await Clipboard.setStringAsync(logs.join("\n"));
    setAttackResult("📋 Logs copied!");
  };

  const handleCopyStringToClipboard = async (str: string) => {
    await Clipboard.setStringAsync(str);
  };

  // ✂️ Mask email
  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    return name[0] + "***@" + domain;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PII Logging Demo</Text>

      {/* SWITCH */}
      <View style={styles.switchContainer}>
        <Text style={styles.text}>
          {isSecureMode ? "🔐 Secure Logging" : "🔓 Insecure Logging"}
        </Text>
        <Switch value={isSecureMode} onValueChange={setIsSecureMode} />
      </View>

      {/* INPUT */}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        placeholderTextColor="#888"
      />

      {/* ACTIONS */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login (Generate Log)</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.attackButton} onPress={handleAttack}>
        <Text style={styles.buttonText}>Simulate Attack</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
        <Text style={styles.buttonText}>Copy Logs</Text>
      </TouchableOpacity>

      {/* LOG VIEWER */}
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.codeButton}
        onPress={() => setShowCode((prev) => !prev)}
      >
        <Text style={styles.buttonText}>
          {showCode ? "Hide Code" : "Show Code"}
        </Text>
      </TouchableOpacity>
      {showCode && (
        <View style={styles.codeContainer}>
          {/* 🔓 Insecure */}
          <Text style={styles.codeTitle}>🔓 Insecure Logging</Text>
          <Text style={styles.codeBlock}>
            {`logger.error("Unable to login", request);`}
          </Text>

          <TouchableOpacity
            onPress={() =>
              handleCopyStringToClipboard(
                `logger.error("Unable to login", request);`,
              )
            }
          >
            <Text style={styles.copy}>Copy</Text>
          </TouchableOpacity>
          {/* 🔐 Secure */}
          <Text style={styles.codeTitle}>🔐 Secure Logging</Text>
          <Text style={styles.codeBlock}>
            {`env: {
      production: {
        plugins: ["transform-remove-console"],
      },
    },`}
          </Text>

          <TouchableOpacity
            onPress={() =>
              handleCopyStringToClipboard(`env: {
      production: {
        plugins: ["transform-remove-console"],
      },
    },`)
            }
          >
            <Text style={styles.copy}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESULT */}
      {attackResult !== "" && <Text style={styles.result}>{attackResult}</Text>}
    </View>
  );
};

export default PiiLoggingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  attackButton: {
    backgroundColor: "#ff3333",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  copyButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  logContainer: {
    marginTop: 10,
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  logText: {
    color: "#00ffcc",
    fontFamily: "monospace",
    marginBottom: 5,
  },
  result: {
    marginTop: 10,
    color: "#ffcc00",
    fontWeight: "bold",
  },
  codeButton: {
    marginTop: 15,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  codeContainer: {
    marginTop: 15,
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 10,
  },

  codeTitle: {
    color: "#ffcc00",
    marginTop: 10,
    fontWeight: "bold",
  },

  codeBlock: {
    color: "#00ffcc",
    fontFamily: "monospace",
    marginTop: 5,
  },

  copy: {
    color: "#00ccff",
    marginTop: 5,
    alignSelf: "flex-end",
  },
});
