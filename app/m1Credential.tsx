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

type DemoTab = "apiKey" | "storedCredentials";
type Mode = "insecure" | "secure";

type SearchParams = {
  mode?: string;
};

const HARDCODED_INSECURE_BASE_URL = "https://core-service-znxz.onrender.com";
const HARDCODED_CLIENT_SECRET = "mobile_client_secret_hardcoded_in_app";
const SECURE_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://core-service-znxz.onrender.com";

export default function M1CredentialScreen() {
  const params = useLocalSearchParams<SearchParams>();

  const [isSecure, setIsSecure] = useState(false);
  const [tab, setTab] = useState<DemoTab>("apiKey");
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
    if (tab === "apiKey") {
      return isSecure ? "/m1/safe-api-key" : "/m1/insecure-api-key";
    }
    return isSecure ? "/m1/safe-stored-credentials" : "/m1/insecure-stored-credentials";
  }, [isSecure, tab]);

  const runRequest = async () => {
    const baseUrl = isSecure ? SECURE_BASE_URL : HARDCODED_INSECURE_BASE_URL;
    const fullUrl = `${baseUrl}${selectedEndpoint}`;

    setRequestUrl(fullUrl);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: isSecure
          ? {
              Accept: "application/json",
            }
          : {
              Accept: "application/json",
              "X-Client-Secret": HARDCODED_CLIENT_SECRET,
              Authorization: "Bearer hardcoded_mobile_token_never_rotated",
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
    ? `// SECURE: API base URL from .env
const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const endpoint = "${selectedEndpoint}";
const response = await fetch(baseUrl + endpoint, {
  method: "GET",
  headers: { Accept: "application/json" },
});`
    : `// INSECURE: hardcoded URL + leaked credentials in client code
const baseUrl = "${HARDCODED_INSECURE_BASE_URL}";
const leakedClientSecret = "${HARDCODED_CLIENT_SECRET}";
const endpoint = "${selectedEndpoint}";
const response = await fetch(baseUrl + endpoint, {
  method: "GET",
  headers: {
    "X-Client-Secret": leakedClientSecret,
    Authorization: "Bearer hardcoded_mobile_token_never_rotated",
  },
});`;

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
      <Text style={styles.title}>M1: Improper Credential Usage</Text>

      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>
          {isSecure ? "Secure Mode (.env base URL)" : "Insecure Mode (Hardcoded + Leaked)"}
        </Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      <View style={styles.tabRow}>
        {renderTab("apiKey", "API Key")}
        {renderTab("storedCredentials", "Stored Credentials")}
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Send Request" onPress={runRequest} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Clear Result" onPress={() => setResult("")} />
      </View>

      <Text style={styles.label}>Request URL</Text>
      <Text style={styles.box}>{requestUrl || "Press Send Request to execute the demo call."}</Text>

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
