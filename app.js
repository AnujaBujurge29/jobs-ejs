const express = require("express");
require("express-async-errors");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash")
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser"); // Add cookie-parser middleware
require("dotenv").config(); // to load the .env file into the process.env object

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    // may throw an error, which won't be caught
    uri: url,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Configure cookie-parser middleware with secret
app.use(cookieParser(process.env.SESSION_SECRET));

// CSRF protection middleware
let csrf_development_mode = true;
const csrf_options = {
    protected_operations: ["POST"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
    cooliesParser: cookieParser,
    cookiesSecrete: process.env.COOKIES_SECRETE,
};

const csrfProtection = csrf(csrf_options);

app.use(flash());

app.use(require("./middleware/storeLocals"));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");

const jobsRouter = require("./routes/jobs"); // Import your jobs router
app.use("/jobs", auth, jobsRouter);

const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, csrfProtection, secretWordRouter);

app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
    try {

        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on Port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();