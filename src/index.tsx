import { Elysia, t } from "elysia";
import { cron } from "@elysiajs/cron";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { basicAuth } from "@eelkevdbos/elysia-basic-auth";

import { readdir } from "node:fs/promises";
import { exec, execSync } from "child_process";
import { filesize } from "filesize";
import { statSync, unlinkSync } from "fs";

import { Root } from "./components";

const backupsDir =
  process.env.NODE_ENV === "production" ? "../backups" : "./backups";

const dumpToFile = async (filePath: string) => {
  console.log("Dumping DB to file...");

  await new Promise((resolve, reject) => {
    exec(
      `pg_dump --dbname=${process.env.BACKUP_DATABASE_URL} --format=tar | gzip > ${filePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error: ", { error: error, stderr: stderr.trimEnd() });
          reject({ error: error, stderr: stderr.trimEnd() });
          return;
        }

        // check if archive is valid and contains data
        const isValidArchive =
          execSync(`gzip -cd ${filePath} | head -c1`).length == 1
            ? true
            : false;
        if (isValidArchive == false) {
          reject({
            error:
              "Backup archive file is invalid or empty; check for errors above",
          });
          return;
        }

        // not all text in stderr will be a critical error, print the error / warning
        if (stderr != "") {
          console.log({ stderr: stderr.trimEnd() });
        }

        console.log("Backup archive file is valid");
        console.log("Backup filesize:", filesize(statSync(filePath).size));

        // if stderr contains text, let the user know that it was potently just a warning message
        if (stderr != "") {
          console.log(
            `Potential warnings detected; Please ensure the backup file "${filePath}" contains all needed data`,
          );
        }

        resolve(undefined);
      },
    );
  });

  console.log("DB dumped to file...");
};

const tryBackup = async () => {
  const date = new Date().toISOString();
  const timestamp = date.replace(/[:.]+/g, "-");
  const filename = `backup-${timestamp}.tar.gz`;
  const filepath = `../backups/${filename}`;

  await dumpToFile(filepath);
};

// Set default credentials for development
if (process.env.NODE_ENV === "development") {
  process.env["BASIC_AUTH_CREDENTIALS"] = "admin:admin;user:user";
}

const app = new Elysia()
  .use(
    cron({
      name: "backup",
      // Defaults to every 10m
      pattern: process.env.CRON_SCHEDUlE ?? "*/10 * * * *",
      async run() {
        // No backups in development
        if (process.env.BACKUP_DATABASE_URL == null) {
          console.error("No database URL provided");
          return;
        }

        await tryBackup();
      },
    }),
  )
  .use(staticPlugin())
  .use(html())
  .use(basicAuth())
  .get("/", async () => {
    const files = await readdir(backupsDir, { withFileTypes: true });

    const parsedFiles = files
      .filter(f => f.isFile())
      .map(f => f.name)
      .sort((a, b) => {
        return (
          statSync(`${backupsDir}/${b}`).mtime.getTime() -
          statSync(`${backupsDir}/${a}`).mtime.getTime()
        );
      });

    return (
      <html lang="en">
        <head>
          <title>File browser</title>
          <script src="https://cdn.tailwindcss.com" />
        </head>
        <body>
          <Root files={parsedFiles} />
          <script src="./public/index.js" />
        </body>
      </html>
    );
  })
  .post(
    "/api/file",
    async ({ body }) => {
      const { filename } = body;

      const filePath = `${backupsDir}/${filename}`;

      return Bun.file(filePath);
    },
    {
      body: t.Object({
        filename: t.String(),
      }),
    },
  )
  .delete(
    "/api/file",
    async ({ body }) => {
      const { filename } = body;

      const filePath = `${backupsDir}/${filename}`;

      unlinkSync(filePath);
    },
    {
      body: t.Object({
        filename: t.String(),
      }),
    },
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
