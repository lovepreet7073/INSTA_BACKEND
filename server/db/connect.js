const mongoose = require("mongoose");

const DB =process.env.MONGODB_URI ;

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


