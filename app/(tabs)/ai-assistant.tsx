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
import { useAuth } from "@/context/AuthContext";
import EventSource from "react-native-sse";
import Markdown from "react-native-markdown-display";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string }[];
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AiAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([]);
    setSessionId(null);
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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.token = token;
      }

      const body: Record<string, any> = {
        message: userMessage.content,
      };

      if (sessionId) {
        body.sessionId = sessionId;
      }

      const es = new EventSource(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const assistantMessageId = (Date.now() + 1).toString();
      let currentContent = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          type: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      es.addEventListener("message", (event) => {
        if (!event.data) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "session" && !sessionId) {
            setSessionId(data.sessionId);
          } else if (data.type === "chunk") {
            currentContent += data.text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: currentContent }
                  : msg
              )
            );
          } else if (data.type === "done") {
            es.close();
            setLoading(false);
          } else if (data.type === "error") {
            es.close();
            setLoading(false);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + "\n\n**[Error: Connection interrupted]**" }
                  : msg
              )
            );
          }
        } catch (e) {
          console.error("SSE Parse Error", e);
        }
      });

      es.addEventListener("error", (event) => {
        console.error("SSE Error:", event);
        es.close();
        setLoading(false);
      });

    } catch (error) {
      console.error("AI assistant error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I am having trouble connecting to the server. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
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
        {item.type === "user" ? (
          <Text style={styles.userText}>{item.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>
            {item.content || "..."}
          </Markdown>
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
          onPress={() => setInputText("Show me available general physicians")}
        >
          <Text style={styles.quickActionText}>Find General Physician</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText("I have a headache and need a doctor")}
        >
          <Text style={styles.quickActionText}>Headache Analysis</Text>
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

const markdownStyles = StyleSheet.create({
  body: {
    color: AppColors.black,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primaryColor,
    marginVertical: 8,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primaryColor,
    marginVertical: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.black,
    marginVertical: 4,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginVertical: 2,
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
});

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
    fontSize: 15,
    lineHeight: 20,
  },
  assistantText: {
    color: AppColors.black,
  },
  timestamp: {
    fontSize: 11,
    color: AppColors.gray,
    marginTop: 4,
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
