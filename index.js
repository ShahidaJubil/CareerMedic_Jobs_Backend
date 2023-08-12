const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/router");
const router = require("./routes/PremiumRouter");
const app = express();
const cors = require("cors");
const verifyJWT = require("./middleware/verifyJWT")
const JWT = require("./controller/jwt")
require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");

const MongoDBStore = require("connect-mongodb-session")(session);


// Set a larger payload size limit
app.use(bodyParser.json({ limit: "100mb" })); // Set the limit based on your requirements
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true })); // Set the limit based on your requirements



const morgan = require("morgan");
//const bodyParser = require("body-parser");
app.use(morgan("dev"));
const cookieParser = require("cookie-parser");

// Middleware for parsing JSON data
app.use(express.json());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:3000"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", [
        "PATCH",
        "POST",
        "GET",
        "DELETE",
        "PUT",
    ]);
    res.setHeader("Access-Control-Allow-Headers", ["Content-Type"]);
    res.setHeader("Access-Control-Expose-Headers", ["Content-Type"]);
    next();
});

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.use("/api", routes);
app.use("/api", router);

// app.use(JWT);
// app.use(verifyJWT);


mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
});
const con = mongoose.connection;

con.on("open", () => {

    console.log("DB Connected");
});

const store = new MongoDBStore({
    uri: process.env.DB,
    collection: "mySessions",
});

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: false,
        store: store,
        // cookie: {
        //   httpOnly: true,
        //   secure: true,
        //   maxAge: 3600 * 1000, // Set an expiration time of 1 hour
        // },
    })
);



app.listen(process.env.PORT, () => {
    console.log("Server running on :", process.env.PORT);
});