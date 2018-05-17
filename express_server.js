var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var express = require("express");
var cookieParser = require("cookie-parser");

app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    users: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// app.get('/urls/:id')

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Posting new URL
app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.sendStatus(404);
  } else {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL === undefined) {
    res.sendStatus(404);
  }
  res.redirect(longURL);
});

//edit - get
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let urls = urlDatabase[shortURL];

  if (urls) {
    res.render("urls_show", {
      shortURL: shortURL,
      urls: urls,
      users: users[req.cookies["user_id"]]
    });
  } else {
    res.sendStatus(404);
  }
});

//Update - POST
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let urls = urlDatabase[shortURL];
  if (urls) {
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/`);
  } else {
    res.redirect("/urls");
  }
});

//delete Post
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.id;
  let urls = urlDatabase[shortURL];

  if (urls) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const idFromCookie = req.cookies["user_id"];
  const loginEmail = req.body.email;
  const loginPass = req.body.password
  var userName = users[idFromCookie];
  // var err1 = res.send(403, "Sorry, email does not exist");
  // var err2 = res.send(403, "Incorrect email or password");
  if (!loginEmail || !loginPass) {
    res.send(403, 'Missed an email or password field!')
  }

  for (let id in users) {
    if (users[id].email === loginEmail) {
        if (users[id].password === loginPass) {
      res.cookie("user_id", id);
      res.redirect("/urls");
    } else {
      res.send(403, 'Incorrect email or password!')
    }
  }
}
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//GET - Register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//POST - Register page
app.post("/register", (req, res) => {
  var randomId = generateRandomString();
  var theEmail = req.body.email;
  var pwd = req.body.password;
  for (let id in users) {
    if (users[id].email === theEmail) {
      res.send(400, "Email in use");
    }
    if (!theEmail || !pwd) {
      res.send(400, "Please input all fields");
    }
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randomId);
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}
