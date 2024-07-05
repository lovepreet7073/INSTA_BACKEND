const mongoose = require("mongoose");

const DB = "mongodb+srv://kodion:kodion%40123@cluster0.2tdayf3.mongodb.net/mernstack";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connectionnnnnn successful`);
  })
  .catch((err) => {
    console.error(`Error connecting to MongoDB:`, err);
  });


