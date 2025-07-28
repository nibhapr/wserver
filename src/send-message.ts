
import { Queue } from "bullmq";
import { redis } from "./utils/redis";

const queue = new Queue("whatsapp-jobs", {
  connection: redis
})
const A = "919495722263";
const B = "919400116811";

const main = async () => {
  for (let i = 0; i < 5; i++) {

    await queue.add("send-message", { number: A, to: B, "text": "Hello" }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000, // Initial delay of 1 second
      }
    })
    await queue.add("send-message", { number: B, to: A, "text": "Hi" }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000, // Initial delay of 1 second
      }
    })
  }
}

main().then(() => {
}).finally(() => {
  process.exit(0);
})
