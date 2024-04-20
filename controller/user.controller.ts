import { connect } from "../dbConn.js";
import User from "../models/user.model.js";

// Function to insert data into the database
async function insertData(data: { name: string; sex: string }[]) {
  try {
    connect(); // Connecting to the database
    for (let i = 0; i < data.length; i += 1000) {
      const batch = data.slice(i, i + 1000); // Inserting data in batches of 1000
      await User.bulkCreate(batch, { validate: true }); // Inserting data into the database
    }
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error while inserting data:", error);
  }
}

// Function to read data from the database
async function readData(): Promise<User[]> {
  // Returning a promise to read data from the database
  return new Promise<User[]>((resolve, reject) => {
    User.findAll() // Finding all the data from the database
      .then((users: User[]) => {
        resolve(users); // Resolving the promise with the data
      })
      .catch((error: any) => {
        reject(error); // Rejecting the promise if any error occurs
      });
  });
}

export { insertData, readData };
