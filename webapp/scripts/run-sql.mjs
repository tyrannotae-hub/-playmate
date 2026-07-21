import { readFileSync } from "node:fs";
import pg from "pg";

const [, , filePath] = process.argv;

if (!filePath) {
  console.error("사용법: npm run db:migrate -- <sql파일경로>");
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error(".env.admin.local 에 SUPABASE_DB_URL이 필요해요.");
  process.exit(1);
}

const sql = readFileSync(filePath, "utf8");
const client = new pg.Client({ connectionString });

await client.connect();
try {
  await client.query(sql);
  console.log(`완료: ${filePath} 적용됨`);
} finally {
  await client.end();
}
