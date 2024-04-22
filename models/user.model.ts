import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../dbConn.js";

// Interface for the user model
interface UserInterface {
    id: number;
    name: string;
    sex: string;
}

// Optional attributes for the user model
type UserAttributes = Optional<UserInterface, 'id'>;

// User model
class User extends Model<UserInterface, UserAttributes> implements UserInterface {
    public declare id: number;
    public declare name: string;
    public declare sex: string;
}

// User model attributes for the database
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