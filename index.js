const amqplib = require("amqplib");
const Broker = require("rascal").BrokerAsPromised;
const config = require("./config.json");

const amqpUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";

async function produce() {
  console.log("amqplib: Publishing");
  const conn = await amqplib.connect(amqpUrl, "heartbeat=60");
  const ch = await conn.createChannel();
  const exch = "test_exchange";
  const q = "test_queue";
  const rkey = "test_route";
  const msg = "Hello amqplib World!";
  await ch
    .assertExchange(exch, "direct", { durable: true })
    .catch(console.error);
  await ch.assertQueue(q, { durable: true });
  await ch.bindQueue(q, exch, rkey);
  await ch.publish(exch, rkey, Buffer.from(msg));
  setTimeout(() => {
    ch.close();
    conn.close();
  }, 500);
}

async function consume() {
  const conn = await amqplib.connect(amqpUrl, "heartbeat=60");
  const ch = await conn.createChannel();
  const q = "test_queue";
  await conn.createChannel();
  await ch.assertQueue(q, { durable: true });
  await ch.consume(
    q,
    (msg) => {
      console.log("amqplib: consumed message: " + msg.content.toString());
      ch.ack(msg);
      ch.cancel("myconsumer");
    },
    { consumerTag: "myconsumer" }
  );
  setTimeout(() => {
    ch.close();
    conn.close();
  }, 500);
}

async function rascal_produce() {
  console.log("rascal: Publishing");
  const msg = "Hello rascal World!";
  const broker = await Broker.create(config);
  broker.on("error", console.error);
  const publication = await broker.publish("demo_publication", msg);
  publication.on("error", console.error);
  console.log("rascal: Published");
}

async function rascal_consume() {
  console.log("rascal: Consuming");
  const broker = await Broker.create(config);
  broker.on("error", console.error);
  const subscription = await broker.subscribe("demo_subscription", "b1");
  subscription.on("message", (message, content, ackOrNack) => {
    console.log("rascal: consumed message: " + content);
    ackOrNack();
    subscription.cancel();
  });
  subscription.on("error", console.error);
  subscription.on("invalid_content", (err, message, ackOrNack) => {
    console.log("Failed to parse message");
  });
}

async function main() {
  await rascal_produce().catch(console.error);
  await rascal_consume().catch(console.error);
  await produce().catch(console.error);
  await consume().catch(console.error);
}

main();
