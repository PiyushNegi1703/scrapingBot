import { chromium } from "playwright";
import { readdir } from "fs/promises";
import csv from "csv-parser";
import { Parse } from "unzipper";
import { createReadStream } from "fs";
import path from "path";
import { insertData, readData } from "./controller/user.controller.js";
import User from "./models/user.model.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const kaggleEmail = process.env.KAGGLE_EMAIL;
const kagglePassword = process.env.KAGGLE_PASSWORD + "##";
const hubspotApiKey = process.env.HUBSPOT_API_KEY;

async function downloadCSV() {
  try {
    const browser = await chromium.launch({
      headless: false,
      downloadsPath: "./csv",
    });
    const context = await browser.newContext({
      acceptDownloads: true,
      bypassCSP: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto("https://kaggle.com", { waitUntil: "load" });

    const signinClick = await page.$(
      "div.sc-iqziPC.gJSBDX > div:nth-child(1) > a"
    );
    await signinClick?.click();

    await delay(2000);
    const signinWithEmailClick = await page.$(
      "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > div > div:nth-child(1) > button:nth-child(2)"
    );

    await signinWithEmailClick?.click();

    await delay(2000);
    await page.waitForSelector(
      "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label"
    );
    const email = await page.$(
      "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label:nth-child(2) > input"
    );
    const password = await page.$(
      "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label:nth-child(3) > input"
    );
    const button = await page.$(
      "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > div:nth-child(5) > button:nth-child(2)"
    );

    await email?.fill(kaggleEmail as string);
    await password?.fill(kagglePassword as string);
    await button?.click();

    await delay(2000);
    await page.goto(
      "https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv",
      { waitUntil: "load" }
    );

    const downloadPromise = page.waitForEvent("download");
    await page.waitForSelector(
      "#site-content > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(5) > div:nth-child(4) > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)"
    );
    const downloadButton = await page.$(
      "#site-content > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(5) > div:nth-child(4) > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)"
    );
    await downloadButton?.click();
    const download = await downloadPromise;

    await download.saveAs("./csv/" + download.suggestedFilename());

    await browser.close();
  } catch (error) {
    console.log("An error occured:", error);
  }
}

type Data = {
  name: string;
  sex: string;
};

async function readCsvFile(): Promise<Data[]> {
  let results: Data[] = [];

  const files = await readdir("csv");
  const zipFile = files.filter((file) => file.includes(".zip"))[0];

  return new Promise<Data[]>((resolve, reject) => {
    createReadStream(path.join("csv", zipFile))
      .pipe(Parse())
      .on("entry", (entry) => {
        entry
          .pipe(csv())
          .on("data", (data: any) => {
            const { Name, Sex } = data;

            results.push({ name: Name, sex: Sex });
          })
          .on("end", () => {
            resolve(results);
          })
          .on("error", (err: any) => {
            reject(err);
          });
      });
  });
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

type UserInHubspot = {
  email: string;
  properties: [
    { property: "firstname"; value: string },
    { property: "gender"; value: string }
  ];
};

async function addUsersToHubspot(users: User[]) {
  // add users to hubspot
  const endpoint = "https://api.hubapi.com/contacts/v1/contact/batch";
  let results: UserInHubspot[] = [];

  for (let i = 0; i < 100; i++) {
    // add user to hubspot
    const { id, name, sex } = users[i];
    results.push({
      email: `test${id}@gmail.com`,
      properties: [
        { property: "firstname", value: name },
        { property: "gender", value: sex },
      ],
    });
  }

  // send the data to hubspot
  const options = {
    method: "POST",
    url: endpoint,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${hubspotApiKey}`,
    },
    body: JSON.stringify(results),
  };

  fetch(`${options.url}`, {
    method: options.method,
    headers: options.headers,
    body: options.body,
  })
    .then((response) => {
      console.log(response.status);
    })
    .catch((error) => {
      console.error(error);
    });
}

(async () => {
  try {
    await downloadCSV();
    console.log("CSV file downloaded successfully");
    const data = await readCsvFile();
    await insertData(data);
    const users = await readData();
    await addUsersToHubspot(users);
  } catch (error) {
    console.log("An error occured:", error);
  }
})();
