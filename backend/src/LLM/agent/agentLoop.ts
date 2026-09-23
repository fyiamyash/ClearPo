import axios from "axios";
import type { reconciliationResult } from "../../reconciliation/resultTypes";
import localAI, { type messageForlocal } from "../adapter/localAI";
import type { responseType } from "../messageTypes";
import { toolCall, type toolname } from "./toolCall";
import type { pdfExtractedDataType } from "../../workers/pdf-extraction-worker";
import { buildReconciliationPrompt } from "./prompts/buildPrompts";

export async function agentLoop(
  resulFromDeterministicFLow: reconciliationResult,
  receivedInvoice_data: pdfExtractedDataType,
) {
  console.log("Calling agent to investigate");
  //   const messageToLLm: messageForlocal[] = [
  //     {
  //       role: "system",
  //       content: systemPropmptForReconciliation,
  //     },
  //   ];
  //   messageToLLm.push({
  //     role: "user",
  //     content: `
  // You are processing an invoice reconciliation investigation.

  // INVOICE_DATA:
  // ${JSON.stringify(receivedInvoice_data, null, 2)}

  // DETERMINISTIC_RECONCILIATION_RESULT:
  // ${JSON.stringify(resulFromDeterministicFLow, null, 2)}
  //   });

  const systemPrompt = buildReconciliationPrompt(resulFromDeterministicFLow, receivedInvoice_data);
  const messageToLLm: messageForlocal[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
  messageToLLm.push({
    role: "user",
    content: JSON.stringify({
      invoice: receivedInvoice_data,
      deterministicResult: resulFromDeterministicFLow,
    }),
  });

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
      console.log("Here is the result from agent investigation!", extracted.content);
      console.log("Investigation completed");
      break;
    } else if (extracted.resType == "toolcall") {
      console.log("Tool call required", extracted.content);
      let toolcallStr: { toolname: toolname; args: any };

      if (typeof extracted.content === "string") {
        toolcallStr = JSON.parse(extracted.content);
      } else if (typeof extracted.content === "object" && extracted.content !== null) {
        toolcallStr = extracted.content as { toolname: toolname; args: any };
      } else {
        throw new Error(`Unexpected content type for toolcall: ${typeof extracted.content}`);
      }
      const toolCallresp = await toolCall(toolcallStr.toolname, toolcallStr.args);
      console.log("TOOL RESULT:");
      console.log(toolCallresp);
      messageToLLm.push({
        role: "assistant",
        content: cleaned,
      });
      messageToLLm.push({
        role: "toolcall",
        content: JSON.stringify(toolCallresp),
      });
      continue;
    }
  }
}
