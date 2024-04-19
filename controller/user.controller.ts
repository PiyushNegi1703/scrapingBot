import sequelize, { connect } from "../dbConn.js";
import User from "../models/user.model.js";

async function insertData(data: { name: string; sex: string }[]) {
  try {
    connect();
    for (let i = 0; i < data.length; i += 1000) {
      const batch = data.slice(i, i + 1000);
      await User.bulkCreate(batch, { validate: true });
    }
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error while inserting data:", error);
  }
}

async function readData(): Promise<User[]> {
  return new Promise<User[]>((resolve, reject) => {
    User.findAll()
      .then((users: User[]) => {
        resolve(users);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

export { insertData, readData };
