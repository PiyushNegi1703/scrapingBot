import { chromium } from "playwright";
import { insertData, readData } from "./controller/user.controller.js";
import dotenv from "dotenv";
import { delay } from "./utils.js";
import signin from "./pageController/signin.controller.js";
import download from "./pageController/download.controller.js";
import addUsersToHubspot from "./pageController/hubspot.controller.js";
import readCsvFile from "./pageController/readfile.controller.js";

dotenv.config();
const kaggleEmail = process.env.KAGGLE_EMAIL || "";
const kagglePassword = process.env.KAGGLE_PASSWORD + "##";
const hubspotApiKey = process.env.HUBSPOT_API_KEY || "";

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

// The main function to call all the functions
(async () => {
  try {
    await downloadCSV();
    console.log("CSV file downloaded successfully");
    const data = await readCsvFile();
    await insertData(data);
    const users = await readData();
    await addUsersToHubspot(users, hubspotApiKey);
  } catch (error) {
    console.log("An error occured:", error);
  }
})();
