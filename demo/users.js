import { createClient } from "./httpClient.js";

export const USERS = [];

for (let i = 1; i <= 10; i++) {
  const { client, jar } = createClient();

  USERS.push({
    id: i,
    email: `user${i}@demo.com`,
    client,
    jar,
    skill:
      i <= 5 ? "pro" :
      i <= 8 ? "normal" : "newbie",
  });
}
