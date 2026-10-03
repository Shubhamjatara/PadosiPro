// components/AuthGuard.tsx

import { Redirect } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getAuthToken } from "@/services/auth";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await getAuthToken();

        setAuthenticated(!!token);
      } catch (error) {
        console.log("Authentication check failed:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authenticated) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
