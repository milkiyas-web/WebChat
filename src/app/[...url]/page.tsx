import ChatWrapper from '@/components/ChatWrapper'
import { ragChat } from '@/lib/rag-chat'
import { redis } from '@/lib/redis'
import { RAGChat } from '@upstash/rag-chat'
import { cookies } from 'next/headers'
import React from 'react'
interface PageProps {
    params: {
        url: string | string[] | undefined
    }
}
function reconstructUrl({ url }: { url: string[] }) {
    const decodedComponent = url.map((component) => decodeURIComponent(component))
    return decodedComponent.join("/")
}
const Page = async ({ params }: PageProps) => {

    const sessionCookie = cookies().get("sessionId")?.value

    console.log(params)
    const reconstructedUrl = reconstructUrl({ url: params.url as string[] })

    const sessionId = (reconstructUrl + "--" + sessionCookie).replace(/\//g, "")
    const isAlreadyIndexed = await redis.sismember("indexed-urls", reconstructedUrl)
    console.log("isalredyindexed", isAlreadyIndexed)

    const initialMessages = await ragChat.history.getMessages({ amount: 10, sessionId })
    if (!isAlreadyIndexed) {
        await ragChat.context.add({
            type: "html",
            source: reconstructedUrl,
            config: { chunkOverlap: 50, chunkSize: 200 }
        })
        await redis.sadd("indexed-urls", reconstructedUrl)
    }

    return (
        <ChatWrapper sessionId={sessionId} initialMessages={initialMessages} />
    )
}

export default Page