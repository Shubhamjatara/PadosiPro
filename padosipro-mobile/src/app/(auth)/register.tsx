import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";

import AuthScreen from "@/components/custom/AuthScreen";
import { ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";
import { saveAuthToken } from "@/services/auth";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { post, loading } = useApi();

  const handleRegister = async () => {
    if (loading) return;
    // Validate the current values before sending the form.
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setError("");
    await post<{ token: string; is_verified: boolean }>(
      "/v1/register",
      { email: email.trim(), password, confirmPassword },
      {
        onSuccess: async (response) => {
          if (!response.data?.token) {
            setError("Could not create your session. Please try again.");
            return;
          }
          await saveAuthToken(response.data.token);
          router.replace("/verify-otp");
        },
        onError: ({ message }) => setError(message),
      },
    );
  };

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start with your email. Add your services after signing up."
    >
      <View style={ui.stack}>
        <TextInput
          mode="outlined"
          label="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          style={ui.input}
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          style={ui.input}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              accessibilityLabel={
                showPassword ? "Hide passwords" : "Show passwords"
              }
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Text style={ui.body}>Use at least 8 characters.</Text>
        <TextInput
          mode="outlined"
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          style={ui.input}
          left={<TextInput.Icon icon="lock-check-outline" />}
        />
        {error ? (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={ui.button}
          contentStyle={ui.buttonContent}
          labelStyle={ui.buttonLabel}
        >
          Create account
        </Button>
      </View>
      <Button
        mode="text"
        onPress={() => router.replace("/login")}
        disabled={loading}
        contentStyle={ui.buttonContent}
      >
        Already have an account? Sign in
      </Button>
    </AuthScreen>
  );
}
