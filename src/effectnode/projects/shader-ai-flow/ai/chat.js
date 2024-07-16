import { StreamingTextResponse, Message } from "ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  BytesOutputParser,
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

export const askGLSL = async ({
  modelName = "",
  messages = [],
  onMessage = () => {},
  onDone = () => {},
}) => {
  const model = new ChatOllama({
    baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
    model: modelName,
  });

  const parser = new StringOutputParser();

  const stream = await model.pipe(parser).stream(
    messages.map((m) => {
      console.log(m);

      return m.role == "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content);
    })
  );

  let response = new StreamingTextResponse(stream);

  const streamRes = new ReadableStream({
    start(controller) {
      if (!response.body) {
        controller.close();
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      function pump() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              onDone();
              controller.close();
              return;
            }
            // Enqueue the chunk of data to the controller
            controller.enqueue(value);

            // console.log(value);
            onMessage({
              text: value,
              // text: decoder.decode(value),
            });
            pump();
          })
          .catch((error) => {
            console.error("Error reading response body:", error);
            controller.error(error);
            onDone();
          });
      }

      pump();
    },
  });

  // Set response headers and return the stream
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "application/json");
  return new Response(streamRes, { headers });
};
