var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var express = require("express");
const bcrypt = require("bcrypt");
var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["Dont worry how this is encrypted"]
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "userRandomID"
  }
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

function urlObject(value) {
  newUrlDatabase = {};
  for (var id in urlDatabase) {
    if (urlDatabase[id].userID === value) {
      newUrlDatabase[id] = urlDatabase[id];
    }
  }
  return newUrlDatabase;
}

app.get("/", (req, res) => {
  if (!users) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
    return;
  }
  let uniqUrls = urlObject(req.session.user_id);
  let templateVars = {
    users: users[req.session.user_id],
    urls: uniqUrls
  };
  if (Object.keys(uniqUrls).length > 0) {
    res.render("urls_index", templateVars);
    return;
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: users[req.session.user_id]
  };
  for (let id in users) {
    if (users[id].id === req.session.user_id) {
      res.render("urls_new", templateVars);
      return;
    }
  }
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users[req.session.user_id],
    shortURL: req.params.id,
    urls: urlDatabase
  };
  if (!users[req.session.user_id] || !urlDatabase[req.params.id]) {
    res.send("Url does not exist!");
    return;
  }
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Posting new URL
app.post("/urls", (req, res) => {
  var longURL = req.body.longURL;
  if (!req.body.longURL) {
    res.sendStatus(404);
    return;
  } else {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      url: longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].url;
  if (longURL === undefined) {
    res.sendStatus(404);
    return;
  }
  res.redirect(longURL);
});

//edit - get
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let urls = urlDatabase[shortURL].url;

  if (urls) {
    res.render("urls_show", {
      shortURL: shortURL,
      urls: urls,
      users: users[req.session.user_id]
    });
  } else {
    res.sendStatus(404);
    return;
  }
});

//Update - POST
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let urls = urlDatabase[shortURL].url;
  if (urls) {
    urlDatabase[shortURL].url = req.body.longURL;
    res.redirect(`/urls/`);
    return;
  } else {
    res.redirect("/urls");
  }
});

//delete Post
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  let urls = urlDatabase[shortURL].url;
  if (urls) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

//GET - Login
app.get("/login", (req, res) => {
  res.render("urls_login");
  if (!urlDatabase[req.params.id]) {
    res.redirect("/urls");
    return;
  }
});

//POST - Login
app.post("/login", (req, res) => {
  var loginEmail = req.body.email;
  var loginPass = req.body.password;
  if (!loginEmail || !loginPass) {
    res.send(403, "Missed an email or password field!");
    return;
  }

  for (let id in users) {
    if (users[id].email === loginEmail) {
      //compare email in Database with input email
      if (bcrypt.compareSync(loginPass, users[id].password)) {
        //compare database hashed pwd with input password
        req.session.user_id = id;
        res.redirect("/urls");
      }
    }
  }
  res.send(403, "Incorrect email or password!");
  return;
});

app.post("/logout", (req, res) => {
  req.session = null;
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
  const hashedPassword = bcrypt.hashSync(pwd, 10);

  for (let id in users) {
    if (users[id].email === theEmail) {
      res.send(400, "Email in use");
      return;
    }
    if (!theEmail || !pwd) {
      res.send(400, "Please input all fields");
      return;
    }
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomId;
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
