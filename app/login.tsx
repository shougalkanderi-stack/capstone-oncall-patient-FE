import { loginPatient, testBackendConnection } from "@/api/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const [civilID, setCivilID] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  // Test backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const isConnected = await testBackendConnection();
      setBackendStatus(isConnected ? "Connected ✅" : "Not Connected ❌");
    } catch (error) {
      setBackendStatus("Connection Failed ❌");
    }
  };

  const handleLogin = async () => {
    if (!civilID.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting login process...");
      const data = await loginPatient(civilID.trim(), password);
      console.log("Login successful:", data);
      
      // Handle different response structures
      const userName = data.user?.name || data.name || data.patient?.name || "User";
      Alert.alert("Login Successful", `Welcome ${userName}`);
      router.push("/homepage");
    } catch (err: any) {
      console.error("Login failed:", err);
      Alert.alert("Login Failed", err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Welcome to OnCall</Text>
        <Text style={styles.subtitle}>Please login to continue</Text>
        {/* Backend Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Backend Status:</Text>
          <Text style={[
            styles.statusText, 
            backendStatus.includes("✅") ? styles.statusSuccess : styles.statusError
          ]}>
            {backendStatus}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkBackendConnection}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <TextInput 
            style={styles.input}
            placeholder="Civil ID" 
            value={civilID}
            onChangeText={setCivilID}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  statusSuccess: {
    color: "#10b981",
  },
  statusError: {
    color: "#ef4444",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "white",
    fontSize: 12,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: 320,
    maxWidth: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    alignItems: "center",
  },
  registerButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
