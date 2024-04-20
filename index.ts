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
import { delay } from "./utils.js";
import signin from "./pageController/signin.controller.js";
import download from "./pageController/download.controller.js";

dotenv.config();
const kaggleEmail = process.env.KAGGLE_EMAIL || "";
const kagglePassword = process.env.KAGGLE_PASSWORD + "##";
const hubspotApiKey = process.env.HUBSPOT_API_KEY;

async function downloadCSV() {
  try {
    // Launching chromium browser
    const browser = await chromium.launch({
      headless: true,
      downloadsPath: "./csv",
    });

    // Creating a browser context
    const context = await browser.newContext({
      acceptDownloads: true,
    });

    const page = await context.newPage(); // Creating a new page
    page.setDefaultTimeout(30000); // Setting the default timeout to 30 seconds

    // Function to go to Kaggle and sign in
    await signin(page, kaggleEmail, kagglePassword);

    await delay(2000); // Creating a delay of 2 seconds to wait for the page to load

    // Funciton to redirect to the csv file page and download the file
    await download(page);

    // Closing the browser after all the tasks are done
    await browser.close();
  } catch (error) {
    // Checking if any error has occured during the process and logging it
    console.log("An error occured:", error);
  }
}

// This a type definition for the data that we are going to read from the csv file and insert into the database
type Data = {
  name: string;
  sex: string;
};

async function readCsvFile(): Promise<Data[]> {
  // Creating an array to store the data recieved from the csv file
  let results: Data[] = [];

  // The file is getting stored in the csv folder so we are reading the files from the csv folder
  const files = await readdir("csv");

  // The downloaded file is a zip file so we are filtering the zip file from the files array
  const zipFile = files.filter((file) => file.includes(".zip"))[0];

  // Entering the zip file and reading the csv file
  return new Promise<Data[]>((resolve, reject) => {
    createReadStream(path.join("csv", zipFile))
      .pipe(Parse()) // Using unzipper to enter the zip file
      .on("entry", (entry) => { // Reading the csv file
        entry
          .pipe(csv()) // Using csv-parser to read the csv file
          .on("data", (data: any) => {
            const { Name, Sex } = data; // Destructuring the data

            results.push({ name: Name, sex: Sex }); // Pushing the data into the results array
          })
          .on("end", () => {
            resolve(results); // Resolving the promise with the results array
          })
          .on("error", (err: any) => {
            reject(err); // Rejecting the promise if any error occurs
          });
      });
  });
}

// Creating a type definition for the data that we are going to send to hubspot
type UserInHubspot = {
  email: string;
  properties: [
    // These properties are the predefined ones in hubspot so using them to send the data
    { property: "firstname"; value: string },
    { property: "gender"; value: string }
  ];
};

async function addUsersToHubspot(users: User[]) {
  // The endpoint to send the data to hubspot
  const endpoint = "https://api.hubapi.com/contacts/v1/contact/batch";
  let results: UserInHubspot[] = []; // Creating an array to store the data that we are going to send to hubspot

  for (let i = 0; i < 100; i++) { 
    // Destructuring the data from the users array
    const { id, name, sex } = users[i];
    results.push({
      email: `test${id}@gmail.com`,
      properties: [
        { property: "firstname", value: name },
        { property: "gender", value: sex },
      ],
    });
  }

  // The options to send the data to hubspot
  const options = {
    method: "POST",
    url: endpoint,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${hubspotApiKey}`,
    },
    body: JSON.stringify(results),
  };

  // Sending the data to hubspot
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

// The main function to call all the functions
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
