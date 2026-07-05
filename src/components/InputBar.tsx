import React from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
};

const MIN_LENGTH = 3;

export default function InputBar({ value, onChangeText, onSend, sending }: Props) {
  const disabled = sending || value.trim().length < MIN_LENGTH;

  return (
    <View style={styles.bar}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Sorunu yaz..."
          placeholderTextColor="#A8B3AC"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
        />
      </View>
      <Pressable onPress={onSend} disabled={disabled}>
        {({ pressed }) => (
          <View style={styles.sendButtonBase}>
            <View
              style={[
                styles.sendButtonTop,
                pressed && styles.sendButtonTopPressed,
                disabled && styles.sendButtonDisabled,
              ]}
            >
              <Ionicons name="arrow-up" size={20} color={colors.nightDeep} />
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: "#EFEAE0",
    backgroundColor: colors.cream,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    borderRadius: 20,
    backgroundColor: "#fff",
    maxHeight: 110,
  },
  input: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.ink },
  sendButtonBase: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.goldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonTop: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -3 }],
  },
  sendButtonTopPressed: { transform: [{ translateY: 0 }] },
  sendButtonDisabled: { opacity: 0.5 },
});