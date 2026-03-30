import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as Sharing from 'expo-sharing';
import { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FileLeakDemoV2() {
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [token, setToken] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [showCode, setShowCode] = useState(false);

  // tạo object file
  const file = new File(Paths.cache, "token.txt");
  const saveToFile = async () => {
    try {
      file.create(); // tạo file
      if (isSecureMode)
        await saveSecure()
      else
        file.write(token); // ghi plaintext
        Alert.alert("Saved", "Token saved to file");
    } catch (e) {
      Alert.alert("Error", "File already existed!");
    }
  };

  // đọc file
  const readFile = async () => {
    try {
      if (isSecureMode) {
        const content = file.textSync();
        setFileContent(content);
      }
      else
        await readSecure()
      
    } catch (e) {
      Alert.alert("Error", "Cannot read file");
    }
  };

  const openFile = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing not available on this device');
        return;
      }
      await Sharing.shareAsync(file.uri);
    } catch (e) {
      alert('Cannot open file');
    }
  };

  // xóa file
  const deleteFile = () => {
    try {
      file.delete();
      setFileContent("");
      Alert.alert("Deleted", "File removed");
    } catch (e) {
      Alert.alert("Error", "No file to delete");
    }
  };

  // ✅ SECURE
  const saveSecure = async () => {
    await SecureStore.setItemAsync("secure_token", token);
    Alert.alert("Saved", "Token saved SECURELY");
  };

  const readSecure = async () => {
    const value = await SecureStore.getItemAsync("secure_token");
    if (value) setFileContent(value);
  };

  const handleCopyStringToClipboard = async (str: string) => {
      await Clipboard.setStringAsync(str);
    };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        📂 File Leak Demo
      </Text>
      <View style={styles.switchContainer}>
        <Text style={styles.text}>
          {isSecureMode ? "Secure exportable file" : "Insecure exportable file"}
        </Text>
        <Switch value={isSecureMode} onValueChange={setIsSecureMode} />
      </View>

      <Text style={{ marginTop: 10 }}>File path:</Text>
      <Text style={{ color: "red" }}>{file.uri}</Text>

      <TextInput
        placeholder="Enter sensitive token"
        value={token}
        onChangeText={setToken}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
      />
      <Button title="Save to File" onPress={saveToFile}/>
      <Button title="Read File" onPress={readFile} />
      <Button title="Open File" onPress={openFile} />
      <Button title="Delete File" onPress={deleteFile} />
      <Text>File Content: {fileContent}</Text>
      <Button title={showCode ? "Hide Code" : "Show Code"} onPress={() => setShowCode((prev) => !prev)} />
      {showCode && (
              <View style={styles.codeContainer}>
                {/* 🔓 Insecure */}
                <Text style={styles.codeTitle}>🔓 Insecure Logging</Text>
                <Text style={styles.codeBlock}>
                  {`const file = new File(Paths.cache, "token.txt");
file.write(token);`}
                </Text>
      
                <TouchableOpacity
                  onPress={() =>
                    handleCopyStringToClipboard(
                      `const file = new File(Paths.cache, "token.txt");
file.write(token);`,
                    )
                  }
                >
                  <Text style={styles.copy}>Copy</Text>
                </TouchableOpacity>
                {/* 🔐 Secure */}
                <Text style={styles.codeTitle}>🔐 Secure Logging</Text>
                <Text style={styles.codeBlock}>
                  {`const key = await SecureStore.getItemAsync('secret_key');
const encryptedData = encryptAES(token, key);
file.write(encryptedData);`}
                </Text>
      
                <TouchableOpacity
                  onPress={() =>
                    handleCopyStringToClipboard(`const key = await SecureStore.getItemAsync('secret_key');
const encryptedData = encryptAES(token, key);
file.write(encryptedData);`)
                  }
                >
                  <Text style={styles.copy}>Copy</Text>
                </TouchableOpacity>
              </View>
            )}
    </ScrollView>
  );
  
}

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
    color: "black",
    fontSize: 20,
    fontWeight: "bold"
  },
  codeButton: {
    marginTop: 15,
    backgroundColor: "blue",
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
