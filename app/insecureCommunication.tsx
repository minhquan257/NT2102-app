import React, { useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://10.0.2.2:3000";

export default function M5Screen() {
  const [isSecure, setIsSecure] = useState(false);
  const [tab, setTab] = useState("login");

  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState("token_alice_plaintext_abc123");

  const [result, setResult] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [showCode, setShowCode] = useState(false);

  const runRequest = async () => {
    let postfix_url = "";
    let method = "GET";
    let headers = {};
    let body = null;

    if (!isSecure) {
      switch (tab) {
        case "login":
          postfix_url = `/m5/login?username=${username}&password=${password}`;
          break;

        case "profile":
          postfix_url = `/m5/profile?token=${token}`;
          break;

        case "sensitive":
          postfix_url = `/m5/sensitive-data`;
          break;
      }
    } else {
      switch (tab) {
        case "login":
          postfix_url = `/m5/safe-login`;
          method = "POST";
          headers["Content-Type"] = "application/json";
          body = JSON.stringify({ username, password });
          break;

        case "profile":
          postfix_url = `/m5/me`;
          method = "GET";
          headers["Authorization"] = `Bearer ${token}`;
          break;

        case "sensitive":
          postfix_url = `/m5/sensitive-data`; // vẫn GET nhưng assume HTTPS backend xử lý
          break;
      }
    }

    setRequestUrl(`${BASE_URL}${postfix_url}`);

    try {
      const res = await fetch(`${BASE_URL}${postfix_url}`, {
        method,
        headers,
        body,
      });

      const text = await res.text();
      setResult(text);
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  const renderTab = (name: string, label: string) => (
    <TouchableOpacity
      key={name}
      style={[styles.tab, tab === name && styles.activeTab]}
      onPress={() => setTab(name)}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>M5: Insecure Communication</Text>
      {/* Toggle Secure */}
      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>
          {isSecure ? "Secure Mode" : "Insecure Mode"}
        </Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {renderTab("login", "Login")}
        {renderTab("profile", "Profile")}
        {!isSecure && renderTab("sensitive", "Sensitive")}
      </View>

      {/* Dynamic Inputs */}
      {tab === "login" && (
        <>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
        </>
      )}

      {tab === "profile" && (
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="Token"
        />
      )}

      <View style={{ marginBottom: 10 }}>
        <Button title="Send Request" onPress={runRequest} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Clear result" onPress={() => setResult("")} />
      </View>

      {/* Request URL */}
      <Text style={styles.label}>Request URL (Leak):</Text>
      <Text style={styles.box}>{requestUrl}</Text>

      {/* Result */}
      <Text style={styles.label}>Result:</Text>
      <Text style={styles.box}>{result}</Text>

      {/* Show Code */}
      <TouchableOpacity onPress={() => setShowCode(!showCode)}>
        <Text style={styles.showCode}>
          {showCode ? "Hide Code ▲" : "Show Code ▼"}
        </Text>
      </TouchableOpacity>

      {showCode && (
        <Text style={styles.code}>
          {tab === "login" &&
            `// ❌ INSECURE: Credentials in URL
GET /m5/login?username=${username}&password=${password}`}

          {tab === "profile" &&
            `// ❌ INSECURE: Token in URL
GET /m5/profile?token=${token}`}

          {tab === "sensitive" &&
            `// ❌ INSECURE: No HTTPS
GET http://server/m5/sensitive-data`}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  tab: {
    padding: 10,
    borderWidth: 1,
    marginRight: 5,
  },

  activeTab: {
    backgroundColor: "#ddd",
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },

  label: {
    marginTop: 15,
    fontWeight: "bold",
  },

  box: {
    backgroundColor: "#eee",
    padding: 10,
    marginTop: 5,
  },

  showCode: {
    marginTop: 15,
    color: "blue",
  },

  code: {
    backgroundColor: "#222",
    color: "#0f0",
    padding: 10,
    marginTop: 10,
    fontFamily: "monospace",
  },
});
