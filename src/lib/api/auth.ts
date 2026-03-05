import api from "@/lib/api/axios";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";

export const loginApi = async (data: LoginInput) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterInput) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/api/me");
  return res.data;
};
