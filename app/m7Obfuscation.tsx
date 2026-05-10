import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Mode = "insecure" | "secure";
type DemoTab = "log" | "code";
type SearchParams = {
  mode?: string;
};

export default function M7ObfuscationScreen() {
  const params = useLocalSearchParams<SearchParams>();

  const [isSecure, setIsSecure] = useState(false);
  const [tab, setTab] = useState<DemoTab>("log");
  const [result, setResult] = useState("");
  const [showCode, setShowCode] = useState(true);

  useEffect(() => {
    if (params.mode === "secure") {
      setIsSecure(true);
      return;
    }
    if (params.mode === "insecure") {
      setIsSecure(false);
    }
  }, [params.mode]);

  const codeSnippet = useMemo(() => {
    if (!isSecure) {
      return `// INSECURE: direct runtime string is easy to spot in logs and analysis
console.log('Hello World');`;
    }

    return `// SECURE: obfuscated log call and encoded message
const encodedMessage = 'SGVsbG8gV29ybGQ=';
const logMethod = console['lo' + 'g'];
const decodedMessage = atob(encodedMessage);
logMethod(decodedMessage);`;
  }, [isSecure]);

  const runDemo = () => {
    if (!isSecure) {
      console.log("Hello World");
      setResult("Hello world");
      return;
    }

    const encodedMessage = "SGVsbG8gV29ybGQ=";
    const logMethod = console["lo" + "g"];
    const decodedMessage = typeof atob === "function" ? atob(encodedMessage) : "Hello World";
    logMethod(decodedMessage);
    setResult("Hello world");
  };

  const renderTab = (name: DemoTab, label: string) => (
    <TouchableOpacity
      key={name}
      style={[styles.tab, tab === name && styles.activeTab]}
      onPress={() => setTab(name)}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );

  const statusLabel = isSecure ? "Secure Mode (obfuscated log)" : "Insecure Mode (direct console.log)";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>M7: Insufficient Binary Protections</Text>

      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>{statusLabel}</Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      <View style={styles.tabRow}>
        {renderTab("log", "Run Demo")}
        {renderTab("code", "Show Code")}
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Execute" onPress={runDemo} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Clear Result" onPress={() => setResult("")} />
      </View>

      <Text style={styles.label}>Result</Text>
      <Text style={styles.box}>{result || "Press Execute to run the logging demo."}</Text>

      {tab === "code" && (
        <>
          <TouchableOpacity onPress={() => setShowCode((prev) => !prev)}>
            <Text style={styles.showCode}>{showCode ? "Hide Code ▲" : "Show Code ▼"}</Text>
          </TouchableOpacity>

          {showCode && <Text style={styles.code}>{codeSnippet}</Text>}
        </>
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
    gap: 6,
  },

  tab: {
    padding: 10,
    borderWidth: 1,
    marginRight: 5,
  },

  activeTab: {
    backgroundColor: "#ddd",
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
