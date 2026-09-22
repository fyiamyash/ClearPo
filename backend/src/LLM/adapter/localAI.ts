import axios from "axios";

export interface messageForlocal {
  role: "user" | "system" | "assistant" | "toolcall";
  content: string;
}
export interface chatCompletionParams {
  model: string;
  message: messageForlocal[];
  temperature?: number;
  max_tokens?: number;
}

class chatCompletion {
  constructor(private baseUrl: string) {}

  async create(params: chatCompletion) {
    const resp = await axios.post(this.baseUrl, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return resp.data;
  }
}

class Chat {
  public completion: chatCompletion;

  constructor(baseUrl: string) {
    this.completion = new chatCompletion(baseUrl);
  }
}

export default class localAI {
  public chat: Chat;
  constructor(options?: { baseurl?: string }) {
    const baseURL = options?.baseurl ?? "http://127.0.0.1:8080/v1/chat/completions";
    this.chat = new Chat(baseURL);
  }
}
