import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "@/constants/colors";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string }[];
}

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getMockResponse(userMessage.content),
        timestamp: new Date(),
        sources: [{ title: "General health guidance" }],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (error) {
      console.error("AI assistant error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getMockResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("flu") || lowerQuery.includes("cold")) {
      return "Flu symptoms can include fever, cough, body aches, and fatigue. For a common cold, runny nose and mild cough are typical. Rest, hydrate, and monitor symptoms. If you feel worse or have high fever, consult a doctor.";
    }

    if (lowerQuery.includes("headache") || lowerQuery.includes("pain")) {
      return "Headaches can be caused by stress, dehydration, or lack of sleep. Try water, rest, and a calm environment. If headaches are severe or persistent, seek medical advice.";
    }

    if (lowerQuery.includes("doctor") || lowerQuery.includes("see")) {
      return "See a doctor if symptoms are severe, do not improve, or include chest pain, breathing difficulty, or high fever. It is always safe to get professional advice.";
    }

    return "I can help with general health questions. Share symptoms or concerns, and I will provide guidance. For personal medical advice, please consult a healthcare professional.";
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.type === "user" ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.type === "user" ? styles.userText : styles.assistantText,
          ]}
        >
          {item.content}
        </Text>

        {item.sources && item.sources.length > 0 && (
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesLabel}>Sources:</Text>
            {item.sources.map((source, index) => (
              <Text key={index} style={styles.sourceText}>
                - {source.title}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsButtons}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText("What are the symptoms of flu?")}
        >
          <Text style={styles.quickActionText}>Flu Symptoms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText("How to prevent common cold?")}
        >
          <Text style={styles.quickActionText}>Cold Prevention</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText("When should I see a doctor?")}
        >
          <Text style={styles.quickActionText}>See a Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerIcon}>
          <Ionicons name="medkit" size={18} color={AppColors.white} />
        </View>
        <View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Instant health guidance</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={renderQuickActions()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about symptoms, care, or next steps"
          placeholderTextColor={AppColors.gray}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} size="small" />
          ) : (
            <Ionicons name="send" size={18} color={AppColors.white} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Warning: This assistant provides general information only. Always
        consult a healthcare professional for medical advice.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryLighter,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primaryColor,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AppColors.gray,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 14,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: AppColors.primaryColor,
  },
  assistantBubble: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.primaryLighter,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: AppColors.white,
  },
  assistantText: {
    color: AppColors.black,
  },
  timestamp: {
    fontSize: 11,
    color: AppColors.gray,
    marginTop: 4,
  },
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.primaryLighter,
  },
  sourcesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.gray,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: AppColors.gray,
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.black,
    marginBottom: 12,
  },
  quickActionsButtons: {
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: AppColors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primaryColor,
  },
  quickActionText: {
    color: AppColors.primaryColor,
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.primaryLighter,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: AppColors.black,
  },
  sendButton: {
    backgroundColor: AppColors.primaryColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: AppColors.gray,
  },
  disclaimer: {
    fontSize: 11,
    color: AppColors.black,
    textAlign: "center",
    padding: 8,
    backgroundColor: "#FFF3CD",
  },
});
