require("dotenv").config({ path: "./env" });
const connectDB = require("./src/DB/db");
const Port = process.env.PORT || 8000;
const app = require("./app");

connectDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`⚙️  Server is running at port : ${Port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

// connectDB();

// app.listen(Port, () => {
//   console.log(`⚙️  Server is running at port : ${Port}`);
// });
