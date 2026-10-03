import storage from "@/services/storage";

export const getAuthToken = async () => {
  return storage.getItem("accessToken");
};

export const saveAuthToken = async (token: string) => {
  return storage.setItem("accessToken", token);
};

export const removeAuthToken = async () => {
  return storage.removeItem("accessToken");
};
