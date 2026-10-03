import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { router } from "expo-router";

import AuthScreen from "@/components/custom/AuthScreen";
import { palette, ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";
import { saveAuthToken } from "@/services/auth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpVerificationScreen() {
  const { post, loading } = useApi();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (timer === 0) return;
    const timeout = setTimeout(
      () => setTimer((previous) => previous - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [timer]);

  const handleVerify = async () => {
    if (loading) return;
    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError("");
    setNotice("");
    await post<{ token: string; is_verified: boolean }>(
      "/v1/verify",
      { otp },
      {
        onSuccess: async (response) => {
          if (!response.data?.token) {
            setError("Could not verify your session. Please try again.");
            return;
          }
          await saveAuthToken(response.data.token);
          router.replace("/profile");
        },
        onError: ({ message }) => setError(message),
      },
    );
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setError("");
    setNotice("");
    setOtp("");
    setTimer(RESEND_SECONDS);
    await post(
      "/v1/resend-otp",
      {},
      {
        onSuccess: () =>
          setNotice("A new code has been sent. Check your email."),
        onError: ({ message }) => {
          setError(message);
          setTimer(0);
        },
      },
    );
  };

  return (
    <AuthScreen
      title="Check your email"
      subtitle="Enter the 6-digit verification code sent to your email address."
    >
      <View style={styles.hint}>
        <Text style={ui.body}>
          Keep this page open while you check your inbox.
        </Text>
      </View>
      <TextInput
        mode="outlined"
        label="Verification code"
        value={otp}
        onChangeText={(value) => {
          setOtp(value.replace(/[^0-9]/g, ""));
          setError("");
        }}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={ui.input}
        contentStyle={styles.code}
        error={!!error}
        onSubmitEditing={handleVerify}
      />
      {error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      ) : null}
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={ui.success}>
          {notice}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={handleVerify}
        loading={loading}
        disabled={loading}
        style={ui.button}
        contentStyle={ui.buttonContent}
        labelStyle={ui.buttonLabel}
      >
        Verify email
      </Button>
      <View style={styles.resend}>
        <Text style={ui.body}>No code yet? Check spam or resend it.</Text>
        <Button
          onPress={handleResend}
          disabled={timer > 0 || loading}
          contentStyle={ui.buttonContent}
        >
          {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
        </Button>
      </View>
      <Button
        mode="text"
        onPress={() => router.replace("/login")}
        disabled={loading}
      >
        Back to sign in
      </Button>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hint: { backgroundColor: palette.primarySoft, padding: 14, borderRadius: 12 },
  code: { fontSize: 24, letterSpacing: 8, textAlign: "center", minHeight: 60 },
  resend: { alignItems: "center", gap: 4 },
});
