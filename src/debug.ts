import prisma from "./utils/db";

async function main() {
    const autoreply = await prisma.autoreplies.create({
        data: {
            type: "text",
            reply: '{"text": "Hello"}',
            device: "917902708908",
            keyword: "Hello",
            user_id: 1,  
            created_at: new Date()       
        }
    })
    console.log(autoreply?.reply)
    console.log(JSON.stringify({text: "Hello"}))
}

main()