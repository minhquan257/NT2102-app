import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import bcrypt, { setRandomFallback } from "bcryptjs";
import MD5 from "crypto-js/md5";
import SHA1 from "crypto-js/sha1";

setRandomFallback((length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 256)),
);

type DemoTab = "hash" | "code";
type SearchParams = {
  mode?: string;
};

export default function M10PasswordHashingScreen() {
  const params = useLocalSearchParams<SearchParams>();

  const [isSecure, setIsSecure] = useState(false);
  const [tab, setTab] = useState<DemoTab>("hash");
  const [password, setPassword] = useState("password123");
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
      return `// INSECURE: fast hashes are easy to brute-force
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';

const md5Hash = MD5(password).toString();
const sha1Hash = SHA1(password).toString();
const result = { md5Hash, sha1Hash };`;
    }

    return `// SECURE: bcrypt adds salt and work factor
import bcrypt from 'bcryptjs';

const saltRounds = 9;
const salt = await bcrypt.genSalt(saltRounds);
const passwordHash = await bcrypt.hash(password, salt);
const result = { saltRounds, salt, passwordHash };`;
  }, [isSecure]);

  const runDemo = async () => {
    if (!password) {
      setResult("Enter a password first.");
      return;
    }

    if (!isSecure) {
      const md5Hash = MD5(password).toString();
      const sha1Hash = SHA1(password).toString();
      setResult([
        "MD5: " + md5Hash,
        "SHA1: " + sha1Hash,
        "These hashes are fast and easier to crack.",
      ].join("\n"));
      return;
    }

    const saltRounds = 9;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    setResult([
      "bcrypt salt rounds: " + String(saltRounds),
      "salt: " + salt,
      "bcrypt hash: " + passwordHash,
      "Salt makes identical passwords hash differently.",
    ].join("\n"));
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

  const statusLabel = isSecure ? "Secure Mode (bcrypt + salt)" : "Insecure Mode (MD5 / SHA1)";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>M10: Weak Password Hashing</Text>

      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>{statusLabel}</Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      <View style={styles.tabRow}>{renderTab("hash", "Hash Demo")}{renderTab("code", "Show Code")}</View>

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <View style={{ marginBottom: 10 }}>
        <Button title="Generate Hash" onPress={runDemo} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Clear Result" onPress={() => setResult("")} />
      </View>

      <Text style={styles.label}>Result</Text>
      <Text style={styles.box}>{result || "Press Generate Hash to compare insecure and secure hashing."}</Text>

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
    whiteSpace: "pre-wrap",
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
