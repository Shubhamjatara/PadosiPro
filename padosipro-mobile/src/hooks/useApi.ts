import storage from "@/services/storage";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import api from "../../api/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  error?: unknown;
}

interface RequestCallbacks<T> {
  onSuccess?: (response: ApiResponse<T>) => void | Promise<void>;
  onError?: (error: ApiError) => void;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async <T>(
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      url: string,
      data?: unknown,
      callbacks?: RequestCallbacks<T>,
    ): Promise<ApiResponse<T> | null> => {
      try {
        setLoading(true);

        const response = await api.request<ApiResponse<T>>({
          method,
          url,
          data,
        });

        const result = response.data;

        // TOKEN EXPIRED
        if (!result.success && result.code === "TOKEN_EXPIRED") {
          await storage.removeItem("accessToken");

          callbacks?.onError?.({
            message: result.message,
            code: result.code,
          });

          return null;
        }

        // OTHER API ERRORS
        if (!result.success) {
          if (!callbacks?.onError) alert(result.message);

          callbacks?.onError?.({
            message: result.message,
            code: result.code,
          });

          return null;
        }

        // SUCCESS
        await callbacks?.onSuccess?.(result);

        return result;
      } catch (error: any) {
        // REDIRECT TO VERIFY OTP SCREEN
        if (error?.response?.data?.code === "VERIFY_OTP") {
          router.replace("/verify-otp");
          callbacks?.onError?.({
            message: error.message,
            code: error.code,
          });

          return null;
        }

        const message =
          error?.response?.data?.message ||
          "Something went wrong. Please try again.";

        const code = error?.response?.data?.code;

        if (!callbacks?.onError) alert(message);

        callbacks?.onError?.({
          message,
          code,
          error,
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Stable functions let screens safely use them in effect dependencies.
  const get = useCallback(
    <T>(url: string, callbacks?: RequestCallbacks<T>) => {
      return request<T>("GET", url, undefined, callbacks);
    },
    [request],
  );

  const post = <T>(
    url: string,
    data?: unknown,
    callbacks?: RequestCallbacks<T>,
  ) => {
    return request<T>("POST", url, data, callbacks);
  };

  const put = <T>(
    url: string,
    data?: unknown,
    callbacks?: RequestCallbacks<T>,
  ) => {
    return request<T>("PUT", url, data, callbacks);
  };

  const patch = useCallback(
    <T>(url: string, data?: unknown, callbacks?: RequestCallbacks<T>) => {
      return request<T>("PATCH", url, data, callbacks);
    },
    [request],
  );

  const remove = <T>(url: string, callbacks?: RequestCallbacks<T>) => {
    return request<T>("DELETE", url, undefined, callbacks);
  };

  return {
    get,
    post,
    put,
    patch,
    delete: remove,
    loading,
  };
};
