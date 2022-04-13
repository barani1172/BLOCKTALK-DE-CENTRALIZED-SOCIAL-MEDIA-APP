const ipfsClient = require("ipfs-http-client");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fileupload = require("express-fileupload");
const fs = require("fs");


const app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://pranaavs2003:pranaavs2003@cluster0.qur1o.mongodb.net/hacknight", {useNewUrlParser: true});
app.use(fileupload());


//ipfs Client
console.log(ipfsClient);
const ipfs = ipfsClient.create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});
var e1 = "";


//mongodb variables
//For users
const userSchema = new mongoose.Schema({
  emailID: String,
  password: String,
  registerDateTime: String,
  postCount: Number,
  posts: [{content:String, date:String}],
  flage: String
});

const User = new mongoose.model("User", userSchema);

//For message
const messageSchema = new mongoose.Schema({
  emailID: String,
  dateTime: String,
  posts: String,
  flage: String
});

const Message = new mongoose.model("Message", messageSchema);


app.get("/", function(req, res) {
  res.render("index");
});

app.post("/", function(req, res) {
  const emailID = req.body.email;
  const password = req.body.password;
  console.log("Email:", emailID);
  console.log("password:", password);

  const user1 = new User({
    emailID: emailID,
    password: password,
    registerDateTime: "Today",
    postCount: 0,
    posts: [],
    flags: "None"
  });

  user1.save()

  res.redirect("/home");
});


app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  const emailID = req.body.email;
  const password = req.body.password;
  e1 = emailID;
  console.log("Email:", emailID);
  console.log("password:", password);

  User.findOne({emailID:emailID}, function(err,foundPerson){
  if(err){
    console.log(err);
  }
  else{
    console.log(foundPerson.password);
    if(foundPerson.password === password){
      res.redirect("/home");
    }
    else{
      res.redirect("/login");
    }
  }
});
});


app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const emailID = req.body.email;
  const password = req.body.password;
  e1 = emailID;
  console.log("Email:", emailID);
  console.log("password:", password);

  const user1 = new User({
    emailID: emailID,
    password: password,
    registerDateTime: "Today",
    postCount: 0,
    posts: [],
    flags: "None"
  });

  user1.save()

  res.redirect("/home");
});


app.get("/home", function(req, res) {
  res.render("home");
});

app.get("/yourPosts", function(req, res) {
  res.render("yourPosts");
});

app.get("/profile", function(req, res) {
  res.render("profile");
});


app.get("/newPost", function(req, res){
  res.render("newPost");
});

app.post("/newPost", (req, res) => {
  // const file = req.files.file;
  // const fileName = req.body.fileName;
  // const filePath = "files/" + fileName;

  const file = req.files.file;
  const fileName = "test";
  const filePath = "files/" + fileName;

  console.log("file= ",file);
  console.log("fileName= ",fileName);
  console.log("filePath= ",filePath);

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("eRRor");
      return res.status(500).send(err);
    }
    const fileDetail = await addFileAuth(fileName, filePath);
    console.log(fileDetail);
    const size = fileDetail.cumulativeSize;
    const fileHash = fileDetail.cid;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
      }
    });
    res.render("newPost", { fileName, fileHash, size });
  });

  res.redirect("/home");
});

const addFile = async (file_name, file_path) => {
  const fileBuffer = fs.readFileSync(file_path);
  const fileAdded = await ipfs.add({
    path: file_path,
    content: fileBuffer,
  });

  console.log(fileAdded);
  const fileHash = fileAdded.cid;

  res.redirect("/home");

  return fileHash;
};

const ethers = require("ethers");

async function addFileAuth(file_name, file_path) {
  const pair = ethers.Wallet.createRandom();
  console.log(pair);
  const sig = await pair.signMessage(pair.address);
  console.log(sig);
  const authHeaderRaw = `eth-${pair.address}:${sig}`;
  console.log(authHeaderRaw);
  const authHeader = Buffer.from(authHeaderRaw).toString("base64");
  console.log(authHeader);
  const ipfsW3GW = "https://crustipfs.xyz";

  const fileBuffer = fs.readFileSync(file_path);

  const ipfs = ipfsClient.create({
    url: `${ipfsW3GW}/api/v0`,
    headers: {
      authorization: `Basic ${authHeader}`,
    },
  });

  // // 2. Add file to ipfs
  const { cid } = await ipfs.add({
    path: file_path,
    content: fileBuffer,
  });
  console.log("CIDDDDD");
  console.log(cid);

  // // 3. Get file status from ipfs
  const fileStat = await ipfs.files.stat("/ipfs/" + cid);
  console.log("FILESTAT");
  console.log(fileStat);

  console.log("File CID: "+fileStat.cid);
  console.log("\n\n");
  console.log("CID link: ");
  console.log("https://ipfs.io/ipfs/"+fileStat.cid);
  // return {
  //     cid: cid.path,
  //     size: fileStat.cumulativeSize
  // };
  return {
    cumulativeSize: fileStat.cumulativeSize,
    cid: fileStat.cid,
  };
}




app.listen(3000, function(req, res) {
  console.log("Server is Listening on Port " + "3000" + "..");
});
