// A persistent, local-only MongoDB replica set for an effortless assignment demo.
const {
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} = require("node:fs");
const { resolve } = require("node:path");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const backend = resolve(
  __dirname,
  "../Lab-03-ShopKart-Product-Discovery/backend",
);
const frontend = resolve(
  __dirname,
  "../Lab-03-ShopKart-Product-Discovery/frontend",
);
const { MongoMemoryServer } = require(
  resolve(backend, "node_modules/mongodb-memory-server"),
);
const dataPath = resolve(__dirname, "../.local-data");
const children = [];
let database;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill("SIGTERM"));
  if (database) await database.stop({ doCleanup: false });
  process.exit(code);
}
async function run() {
  mkdirSync(resolve(dataPath, "mongo"), { recursive: true });
  const secretPath = resolve(dataPath, "session-secret");
  if (!existsSync(secretPath))
    writeFileSync(secretPath, randomBytes(48).toString("hex"), { mode: 0o600 });
  // A fixed dedicated port keeps the persisted replica-set configuration valid
  // across restarts, without interfering with an existing MongoDB on 27017.
  database = new MongoMemoryServer({
    instance: {
      port: 27018,
      dbPath: resolve(dataPath, "mongo"),
      replSet: "shopkart",
      storageEngine: "wiredTiger",
      ip: "127.0.0.1",
    },
  });
  await database.start(true);
  const { MongoClient } = require(
    resolve(backend, "node_modules/mongoose"),
  ).mongo;
  const client = new MongoClient(
    "mongodb://127.0.0.1:27018/?directConnection=true",
  );
  await client.connect();
  const admin = client.db("admin");
  try {
    await admin.command({
      replSetInitiate: {
        _id: "shopkart",
        members: [{ _id: 0, host: "127.0.0.1:27018" }],
      },
    });
  } catch (error) {
    if (error.code !== 23) throw error;
    const { config } = await admin.command({ replSetGetConfig: 1 });
    if (config.members[0].host !== "127.0.0.1:27018") {
      config.members = [{ _id: 0, host: "127.0.0.1:27018" }];
      await admin.command({ replSetReconfig: config, force: true });
    }
  }
  await client.close();
  const uri = "mongodb://127.0.0.1:27018/shopkart?replicaSet=shopkart";
  const env = {
    ...process.env,
    MONGO_URI: uri,
    JWT_SECRET: readFileSync(secretPath, "utf8"),
    CLIENT_URL: "http://localhost:5173",
    PORT: "3000",
  };
  const seed = spawn(process.execPath, ["seed.js"], {
    cwd: backend,
    env,
    stdio: "inherit",
  });
  const exit = await new Promise((resolve) => seed.on("exit", resolve));
  if (exit !== 0) throw new Error("Catalog seeding failed");
  children.push(
    spawn(process.execPath, ["index.js"], {
      cwd: backend,
      env,
      stdio: "inherit",
    }),
  );
  children.push(
    spawn(
      "npm",
      [
        "run",
        "dev",
        "--",
        "--host",
        "127.0.0.1",
        "--port",
        "5173",
        "--strictPort",
      ],
      { cwd: frontend, env, stdio: "inherit" },
    ),
  );
  children.forEach((child) => {
    child.on("error", (error) => {
      console.error(error.message);
      stop(1);
    });
    child.on("exit", () => {
      if (!stopping) stop(1);
    });
  });
  console.log(
    "ShopKart: http://localhost:5173 · API: http://localhost:3000 · MongoDB data: .local-data/mongo",
  );
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
run().catch((error) => {
  console.error(error.message);
  stop(1);
});
