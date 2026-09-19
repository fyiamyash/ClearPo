export type user = "user" | "system";

export type messageTypeForPdf = {
  role: user;
  content: string;
};
