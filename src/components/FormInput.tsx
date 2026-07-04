import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type FormInputProps = TextInputProps & {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  rightElement?: React.ReactNode;
};

export default function FormInput({ icon, rightElement, onFocus, onBlur, ...rest }: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      <Ionicons name={icon} size={19} color={focused ? colors.goldDeep : "#9CA79F"} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#A8B3AC"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E4DFD1",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 13,
    backgroundColor: "#fff",
  },
  wrapperFocused: { borderColor: colors.goldDeep },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.ink },
});