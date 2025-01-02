import { verifyHmacSha256 } from "../utils/common"
import { prisma } from "../utils/db"

export const getWebhookUser = async (payload: string, hmac: string) => {
    const users = await prisma.users.findMany()
    for (const user of users) {
        if (verifyHmacSha256("test", payload, hmac)) {
            const number = await prisma.numbers.findFirst({where: {user_id: user.id}})
            return number
        }
        return null
    }
}