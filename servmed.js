const express =require("express")
var bodyParser = require("body-parser")
const  mongoose=require('mongoose')
var path=require("path")
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
const mdb= mongoose.createConnection("mongodb+srv://soum_db:atlas_123@cluster1.knv1aqa.mongodb.net/Medicine_Information");
const mdb1= mongoose.createConnection("mongodb+srv://soum_db:atlas_123@cluster1.knv1aqa.mongodb.net/User_Database");
mdb.on('error',()=>console.log("Error in Connecting to Database"));
mdb.once('open',()=>console.log("Connected to Medicine_Information"))
mdb1.on('error',()=>console.log("Error in Connecting to Database"));
mdb1.once('open',()=>console.log("Connected to User_Database"))
app.use(express.static(path.join(__dirname, 'medialert')));
app.post('/register', async(req,res)=>{
    try {
        const Email = req.body.email;
        const Password = req.body.password;
        const logdata = {
          "Userid": Email,
          "Password": Password
        };
          await mdb1.collection('Register').insertOne(logdata);
          console.log("Record inserted successfully");
          res.redirect('/Patient_registered_Successfully.html');
      } catch (error) {
        console.error("Error during login process:", error);
        res.status(500).send("Internal Server Error");
      }
})
app.post('/Login', async (req, res) => {
    try {
      const Email = req.body.email;
      const Password = req.body.password;
      //const E= await mdb1.collection("Register").findOne({"Userid"})
      const logdata = {
        "Userid": Email,
        "Password": Password
      };
      const E= await mdb1.collection("Register").findOne({"Userid":logdata.Userid},{"Password":logdata.Password})
      if (E) {
        await mdb1.collection('Login').insertOne(logdata);
        console.log("Record inserted successfully");
        res.redirect('/Main.html');
      } else {
        res.send("Login session failed!! Check whether the password  or email-id you have entered is invalid or not");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  app.get('/showmedicine',async(req,res)=>{
    try
  {
    const col= mdb1.collection('Login')
    const total = await col.countDocuments();
    const documents = await col.find({}).toArray();
    const docid = documents[total - 1].Userid;
    const pid=documents[total-1].Password;
  //console.log(docid)
  res.json({message:docid,value:pid})
  }
 catch(error)
 {
  res.status(500).json({error: error.message});
 }
  })
const port=5050
app.listen((port),(req,res)=>{
 console.log(`Server is running on port ${port}`);
})