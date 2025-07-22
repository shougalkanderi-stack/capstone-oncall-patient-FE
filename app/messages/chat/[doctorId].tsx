import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const doctorData: Record<string, { name: string; specialty: string }> = {
  "1": { name: "Dr. Ethan Carter", specialty: "Cardiologist" },
  "2": { name: "Dr. Sophia Hayes", specialty: "Dermatologist" },
  "3": { name: "Dr. Noah Bennett", specialty: "Pediatrician" },
  "4": { name: "Dr. Olivia Reed", specialty: "Neurologist" },
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function DoctorChatPage() {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const doctor = doctorData[doctorId || "1"];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      return () => {};
    }, [])
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: "transparent" },
          headerTransparent: true,
          headerTintColor: "transparent",
          headerBackVisible: false,
        }}
      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
        hidden={false}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.doctorName}>{doctor?.name || "Doctor"}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.doctorSpecialty}>
                  {doctor?.specialty || ""} • Online
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((message, index) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser
                    ? styles.messageContainerUser
                    : styles.messageContainerDoctor,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser
                      ? styles.messageBubbleUser
                      : styles.messageBubbleDoctor,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser
                        ? styles.messageTextUser
                        : styles.messageTextDoctor,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={500}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!input.trim()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={input.trim() ? "#ffffff" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  moreButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  messageContainer: {
    marginVertical: 6,
  },
  messageContainerUser: {
    alignItems: "flex-end",
  },
  messageContainerDoctor: {
    alignItems: "flex-start",
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: "75%",
    minWidth: 60,
  },
  messageBubbleDoctor: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBubbleUser: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 6,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextDoctor: {
    color: "#374151",
  },
  messageTextUser: {
    color: "#ffffff",
  },
  timestamp: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 15,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxHeight: 120,
    minHeight: 44,
    textAlignVertical: "center",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#f1f5f9",
    shadowOpacity: 0,
    elevation: 0,
  },
});
