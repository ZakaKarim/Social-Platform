import mongoose from 'mongoose';

//Another Method to connected with the database 
//const MongoURL = 'mongodb://localhost:27017/Soical-Platform';


//Live DataBase URL
const MongoURL = process.env.DB_URL;
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(MongoURL);
        console.log('⚙️ Connected to MongoDB Server⚙️');
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error", error);
        process.exit(1);
    }
};

export default connectDB