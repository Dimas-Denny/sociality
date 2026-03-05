import api from "./axios";

export const getPostsApi = async () => {
  const res = await api.get("/posts");
  return res.data;
};
