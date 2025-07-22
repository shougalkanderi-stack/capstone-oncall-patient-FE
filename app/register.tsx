import { registerPatient } from "@/api/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    civilID: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'civilID', 'password'];
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form].trim());
    
    if (missingFields.length > 0) {
      Alert.alert("Error", `Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting registration process...");
      await registerPatient(form);
      console.log("Registration successful");
      Alert.alert("Success", "Registration completed successfully! You can now login.", [
        {
          text: "OK",
          onPress: () => router.push("/login")
        }
      ]);
    } catch (error: any) {
      console.error("Registration failed:", error);
      Alert.alert("Error", error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Please fill in your details to register</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={form.name}
            onChangeText={(value) => handleInputChange("name", value)}
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address *"
            value={form.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={form.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Civil ID *"
            value={form.civilID}
            onChangeText={(value) => handleInputChange("civilID", value)}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={form.password}
            secureTextEntry
            onChangeText={(value) => handleInputChange("password", value)}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleBackToLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
  registerButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    alignItems: "center",
  },
  loginButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
