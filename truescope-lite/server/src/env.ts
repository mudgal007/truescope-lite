export const env = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173"
};
