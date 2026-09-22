export type user = "user" | "system" | "toolResponse";

export type messageTypeForPdf = {
  role: user;
  content: string;
};

export type responseType = {
  resType: "Text" | "toolcall";
  content: string;
};
