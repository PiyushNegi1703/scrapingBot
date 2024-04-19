import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../dbConn.js";

interface UserInterface {
    id: number;
    name: string;
    sex: string;
}

type UserAttributes = Optional<UserInterface, 'id'>;

class User extends Model<UserInterface, UserAttributes> implements User {
    public declare id: number;
    public declare name: string;
    public declare sex: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
})

export default User;