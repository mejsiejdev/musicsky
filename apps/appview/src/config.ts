export const config = {
  port: parseInt(process.env.PORT ?? "3001"),
  dbPath: process.env.DATABASE_PATH ?? "appview.db",
  tapUrl: process.env.TAP_URL ?? "http://localhost:2480",
  tapAdminPassword: process.env.TAP_ADMIN_PASSWORD,
};
