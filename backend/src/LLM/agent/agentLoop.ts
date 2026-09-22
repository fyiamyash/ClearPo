import axios from "axios";
import type { reconciliationResult } from "../../reconciliation/resultTypes";
import localAI, { type messageForlocal } from "../adapter/localAI";
import type { responseType } from "../messageTypes";
import { systemPropmptForReconciliation } from "./systemPrompt";
import { toolCall } from "./toolCall";

export async function agentLoop(resulFromDeterministicFLow: reconciliationResult) {
  const messageToLLm: messageForlocal[] = [
    {
      role: "system",
      content: systemPropmptForReconciliation,
    },
  ];
  messageToLLm.push({ role: "user", content: "hello llm!" });

  while (true) {
    const data_from_llm: any = await axios.post(
      "http://127.0.0.1:8080/v1/chat/completions",
      {
        model: "mlx-community/Llama-3.2-3B-Instruct-4bit",
        messages: messageToLLm,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const rawContent = data_from_llm.data.choices[0].message.content;
    const cleaned = rawContent.replace(/<\|.*?\|>/g, "").trim();
    let extracted: responseType;
    try {
      extracted = JSON.parse(cleaned);
    } catch (err) {
      console.error("error whilre parsong the raw content of llm to json", err);
      return;
    }
    if (extracted.resType === "Text") {
      console.log(extracted.content);
      break;
    } else if (extracted.resType == "toolcall") {
      const toolCallresp = JSON.stringify(toolCall(extracted.content));
      messageToLLm.push({
        role: "toolcall",
        content: toolCallresp,
      });
      continue;
    }
  }
}
