import { USERS } from "./users.js";

const ROOM_ID = "ROOM_DEMO";

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function join(user) {
  await sleep(Math.random() * 5000); // vào phòng rải đều

  await user.client.post("/room/join", {
    roomId: ROOM_ID,
  });

  console.log(`✅ User ${user.id} joined`);
}

async function run() {
  console.log("🚪 PHASE: JOIN ROOM");
  await Promise.all(USERS.map(join));
  console.log("🎉 ALL USERS JOINED");
}

run();
