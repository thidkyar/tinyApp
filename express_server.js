var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// app.get('/urls/:id')

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  if (!req.body.longURL){
    res.sendStatus(404)
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
    res.render("urls_show", { shortURL: shortURL, urls: urls });
  } else {
    res.sendStatus(404);
  }
});

//Update - POST
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let urls = urlDatabase[shortURL];
  if(urls){
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 6);
}
