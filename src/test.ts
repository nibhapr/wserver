import { Queue } from "bullmq";
import { redis } from "./utils/redis";

const queue = new Queue("whatsapp-jobs", {
  connection: redis
})

const A = "919495722263";
const B = "919400116811";

const main = async () => {
  await queue.add("connect-whatsapp", { number: A })
  await queue.add("connect-whatsapp", { number: B })
  // for (let i = 0; i < 50; i++) {
  //   await queue.add("send-message", { number: "917902708908", to: "917012749946", "text": `Hello ${i + 1}` })
  // }
}

main().then(() => {
}).finally(() => {
  process.exit(0);
})
