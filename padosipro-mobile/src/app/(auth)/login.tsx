import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";

import AuthScreen from "@/components/custom/AuthScreen";
import { ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";
import { saveAuthToken } from "@/services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { post, loading } = useApi();

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    await post<{ token: string; is_verified: boolean }>(
      "/v1/login",
      { email: email.trim(), password },
      {
        onSuccess: async (response) => {
          await saveAuthToken(response.data.token);
          router.replace(response.data.is_verified ? "/(tabs)" : "/verify-otp");
        },
        onError: ({ message }) => setError(message),
      },
    );
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to manage your profile and services."
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
          autoComplete="current-password"
          style={ui.input}
          onSubmitEditing={handleLogin}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {error ? (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={ui.button}
          contentStyle={ui.buttonContent}
          labelStyle={ui.buttonLabel}
        >
          Sign in
        </Button>
      </View>
      <Text style={[ui.body, { textAlign: "center" }]}>New to PadosiPro?</Text>
      <Button
        mode="outlined"
        onPress={() => router.push("/register")}
        disabled={loading}
        style={ui.button}
        contentStyle={ui.buttonContent}
      >
        Create an account
      </Button>
    </AuthScreen>
  );
}
