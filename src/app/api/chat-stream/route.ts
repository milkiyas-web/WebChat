import { ragChat } from "@/lib/rag-chat";
import { NextRequest } from "next/server";
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
export const POST = async (req: NextRequest) => {
  const { messages, sessionId } = await req.json();
  const lastMessage = messages[messages.length - 1].content;
  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    sessionId,
  });
  return aiUseChatAdapter(response);
  console.log("response", response);
};
