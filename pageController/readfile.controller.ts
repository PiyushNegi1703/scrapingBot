import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { Parse } from "unzipper";

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
      .on("entry", (entry) => {
        // Reading the csv file
        entry
          .pipe(csvParser()) // Using csv-parser to read the csv file
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

export default readCsvFile
