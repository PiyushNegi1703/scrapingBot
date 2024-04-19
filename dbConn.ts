import { Sequelize } from "sequelize";

const connectionDetails = {
  database: "plena_project",
  username: "root",
  password: "Piy2205##",
  dialectOptions: {
    host: "localhost",
    port: "3306",
  },
};

export const sequelize = new Sequelize({
  dialect: "mysql",
  ...connectionDetails,
});

async function connect(){
    try {
        sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

export default sequelize;
export { connect };
