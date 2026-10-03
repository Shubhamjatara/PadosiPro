import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";

import { palette, ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";

type Profile = {
  name: string;
  mobileNumber: string;
  address: string;
  businessName: string;
};

export default function ProfileScreen() {
  const { get, patch, loading } = useApi();
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadError("");
      await get<Profile>("/v1/profile", {
        onError: ({ message }) => {
          setLoadError(message);
        },
        onSuccess: (response) => {
          if (response) {
            setName(response.data.name ?? "");
            setMobileNumber(response.data.mobileNumber ?? "");
            setAddress(response.data.address ?? "");
            setBusinessName(response.data.businessName ?? "");
          }
        },
      });
    };
    void loadProfile();
  }, [get, retry]);

  const nameError =
    name.trim().length < 2
      ? "Enter your full name (at least 2 characters)."
      : "";
  const mobileError = !/^[6-9]\d{9}$/.test(mobileNumber)
    ? "Enter a valid 10-digit mobile number."
    : "";
  const addressError =
    address.trim().length < 3 ? "Enter your complete address." : "";

  const handleSave = async () => {
    setSubmitted(true);
    setSaved(false);
    if (nameError || mobileError || addressError || loading) return;
    setError("");
    await patch(
      "/v1/profile",
      {
        name: name.trim(),
        mobileNumber,
        address: address.trim(),
        businessName: businessName.trim(),
      },
      {
        onSuccess: () => setSaved(true),
        onError: ({ message }) => setError(message),
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={ui.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={ui.content}
      >
        <View style={ui.row}>
          <View style={ui.iconBox}>
            <Ionicons name="person-outline" size={24} color={palette.primary} />
          </View>
          <View style={ui.grow}>
            <Text style={ui.sectionTitle}>Your business starts with you</Text>
            <Text style={ui.body}>Keep your contact details up to date.</Text>
          </View>
        </View>
        {loading ? (
          <View style={[ui.card, ui.centered]}>
            <ActivityIndicator color={palette.primary} />
            <Text style={ui.body}>Loading your profile…</Text>
          </View>
        ) : loadError ? (
          <View style={ui.card}>
            <Text accessibilityRole="alert" style={ui.error}>
              {loadError}
            </Text>
            <Button onPress={() => setRetry((value) => value + 1)}>
              Reload profile
            </Button>
          </View>
        ) : (
          <View style={ui.card}>
            <Text style={ui.sectionTitle}>Personal details</Text>
            <View style={ui.stack}>
              <TextInput
                mode="outlined"
                label="Full name"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setSaved(false);
                }}
                autoCapitalize="words"
                autoComplete="name"
                style={ui.input}
                error={submitted && !!nameError}
              />
              {submitted && nameError ? (
                <Text style={ui.error}>{nameError}</Text>
              ) : null}
              <TextInput
                mode="outlined"
                label="Mobile number"
                value={mobileNumber}
                onChangeText={(value) => {
                  setMobileNumber(value.replace(/\D/g, ""));
                  setSaved(false);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                style={ui.input}
                left={<TextInput.Affix text="+91" />}
                error={submitted && !!mobileError}
              />
              {submitted && mobileError ? (
                <Text style={ui.error}>{mobileError}</Text>
              ) : null}
              <TextInput
                mode="outlined"
                label="Address"
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  setSaved(false);
                }}
                multiline
                numberOfLines={3}
                style={ui.input}
                contentStyle={{ minHeight: 96, textAlignVertical: "top" }}
                error={submitted && !!addressError}
              />
              {submitted && addressError ? (
                <Text style={ui.error}>{addressError}</Text>
              ) : null}
            </View>
            <Text style={ui.sectionTitle}>Business details</Text>
            <TextInput
              mode="outlined"
              label="Business name (optional)"
              value={businessName}
              onChangeText={(value) => {
                setBusinessName(value);
                setSaved(false);
              }}
              autoCapitalize="words"
              style={ui.input}
            />
            <Text style={ui.body}>
              Leave this blank if you work under your own name.
            </Text>
            {error ? (
              <Text accessibilityRole="alert" style={ui.error}>
                {error}
              </Text>
            ) : null}
            {saved ? (
              <Text accessibilityLiveRegion="polite" style={ui.success}>
                Your profile has been saved.
              </Text>
            ) : null}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={ui.button}
              contentStyle={ui.buttonContent}
              labelStyle={ui.buttonLabel}
            >
              Save profile
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
