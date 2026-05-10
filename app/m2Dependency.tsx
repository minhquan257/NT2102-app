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

type DemoTab = "dependencies" | "audit";
type SearchParams = {
  mode?: string;
};

const INSECURE_BASE_URL = "http://core-service-znxz.onrender.com";
const SECURE_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://core-service-znxz.onrender.com";

export default function M2DependencyScreen() {
  const params = useLocalSearchParams<SearchParams>();

  const [isSecure, setIsSecure] = useState(false);
  const [tab, setTab] = useState<DemoTab>("dependencies");
  const [result, setResult] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (params.mode === "secure") {
      setIsSecure(true);
      return;
    }
    if (params.mode === "insecure") {
      setIsSecure(false);
    }
  }, [params.mode]);

  const selectedEndpoint = useMemo(() => {
    if (tab === "dependencies") {
      return isSecure ? "/m2/safe-dependencies" : "/m2/insecure-dependencies";
    }
    return isSecure ? "/m2/safe-build-info" : "/m2/insecure-build-info";
  }, [isSecure, tab]);

  const runRequest = async () => {
    const baseUrl = isSecure ? SECURE_BASE_URL : INSECURE_BASE_URL;
    const fullUrl = `${baseUrl}${selectedEndpoint}`;

    setRequestUrl(fullUrl);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();
      setResult(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult(`Error: ${message}`);
    }
  };

  const codeSnippet = isSecure
    ? `// SECURE: audit the dependency tree before release
const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const endpoint = "${selectedEndpoint}";
const response = await fetch(baseUrl + endpoint, {
  method: "GET",
  headers: { Accept: "application/json" },
});

// CI / release gate
npm audit
npm audit --production
npm ls --all`
    : `// INSECURE: ship an old library without audit coverage
const baseUrl = "${INSECURE_BASE_URL}";
const endpoint = "${selectedEndpoint}";
const response = await fetch(baseUrl + endpoint, {
  method: "GET",
  headers: { Accept: "application/json" },
});

// package.json contains vulnerable versions
{
  "dependencies": {
    "lodash": "4.17.15",
    "express": "4.16.2"
  }
}`;

  const renderTab = (name: DemoTab, label: string) => (
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
      <Text style={styles.title}>M2: Inadequate Supply Chain Security</Text>

      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>
          {isSecure ? "Secure Mode (.env + audit scan)" : "Insecure Mode (Old Library)"}
        </Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      <View style={styles.tabRow}>
        {renderTab("dependencies", "Dependencies")}
        {renderTab("audit", "Audit / Build Info")}
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Send Request" onPress={runRequest} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Clear Result" onPress={() => setResult("")} />
      </View>

      <Text style={styles.label}>Request URL</Text>
      <Text style={styles.box}>{requestUrl || "Press Send Request to execute the dependency demo."}</Text>

      <Text style={styles.label}>Result</Text>
      <Text style={styles.box}>{result || "Response payload will appear here."}</Text>

      <TouchableOpacity onPress={() => setShowCode((prev) => !prev)}>
        <Text style={styles.showCode}>{showCode ? "Hide Code ▲" : "Show Code ▼"}</Text>
      </TouchableOpacity>

      {showCode && <Text style={styles.code}>{codeSnippet}</Text>}
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
