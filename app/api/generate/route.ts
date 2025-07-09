import { NextResponse } from 'next/server';
import { tools, ToolName } from '@/lib/ai-tools';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getUserReport } from '@/lib/actions/report.actions';

export async function POST(request: Request) {
    const { prompt } = await request.json();

    const user = await getLoggedInUser();

    const userId = user.$id;

    console.log(userId);

    const toolChoosingResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
            role: "system",
            content: `
                You are a smart assistant for YouX Bank. You must decide if the user's prompt requires calling a function.
                If so, respond only with: ToolCall: <functionName>.
                Available tools: getLastTransaction, getTopRecipient, getUserBanks, getBalance, getUserReport.
                If the prompt does not match a tool, just answer normally.
            `.trim()
,
            },
            {
            role: "user",
            content: prompt,
            },
        ],
        }),
    });

    if (!toolChoosingResponse.ok) {
        const text = await toolChoosingResponse.text();
        console.error("Groq API error:", text);
        return NextResponse.json({ error: "Groq API failed: " + text }, { status: 500 });
    }

    const aiToolResponse = await toolChoosingResponse.json();
    const aiReply = aiToolResponse.choices?.[0]?.message?.content?.trim();

    if (aiReply?.startsWith("ToolCall:")) {

        const toolName = aiReply.split(":")[1].trim() as ToolName;

        const result = await tools[toolName](userId);

        if (toolName in tools) {
            if (toolName === 'getUserReport') {
                const reportObj = await getUserReport({ userId });
                return NextResponse.json({ result: reportObj });
            }

            const finalAIResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `Tool result for ${toolName}: ${JSON.stringify(result)}`
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                }),
            });

            const finalData = await finalAIResponse.json();
            return NextResponse.json({ result: finalData.choices?.[0]?.message?.content });
        }
    }

    return NextResponse.json({ result: aiReply });
}
