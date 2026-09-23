import axios from "axios";
import type { messageTypeForPdf } from "../messageTypes";
import { pdfPrompt } from "./systemPropmptForPdf";

export async function llm_call_for_pdfExtraction(textMessage: string) {
  const mess: messageTypeForPdf[] = [
    {
      role: "system",
      content: pdfPrompt,
    },
    {
      role: "user",
      content: textMessage,
    },
  ];

  const data_from_llm: any = await axios.post(
    "http://127.0.0.1:8080/v1/chat/completions",
    {
      model: "mlx-community/Llama-3.2-3B-Instruct-4bit",
      messages: mess,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const rawContent = data_from_llm.data.choices[0].message.content;

  const cleaned = rawContent.replace(/<\|.*?\|>/g, "").trim();
  let extracted;
  try {
    extracted = JSON.parse(cleaned);
  } catch (err) {
    console.error("error whilre parsong the raw content of llm to json", err);
    return;
  }
  return extracted;
}
