import { Sequelize } from "sequelize";

// Connection details
const connectionDetails = {
  database: "plena_project",
  username: "root",
  password: "Piy2205##",
  dialectOptions: {
    host: "localhost",
    port: "3306",
  },
};

// Creating a new instance of sequelize
export const sequelize = new Sequelize({
  dialect: "mysql",
  ...connectionDetails,
});

// Function to connect to the database
async function connect() {
  try {
    // Testing the connection
    sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export default sequelize;
export { connect };
