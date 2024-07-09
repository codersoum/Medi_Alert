const express =require("express");
var bodyParser = require("body-parser");
const  mongoose=require('mongoose');
var nodemailer= require("nodemailer");
var cron=require("node-cron");
var path=require("path");
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
app.post("/postusermedic",async(req,res)=>
  {
   var data={
    "UserId":req.body.UserId,  
    "MedicineName":req.body.MedicineName,
    "ExpiryDate":req.body.ExpiryDate
  }
  await mdb.collection('Registered_User_medicinedata').insertOne(data,(err)=>{
    if(err){
      throw err;
  }
  console.log("Record Inserted Successfully");
  })
   var E=await mdb.collection('Registered_User_medicinedata').find({"UserId":data.UserId}).toArray()
   var formattedMedicineList=" "
   for( var i=0;i<E.length;i++)
   formattedMedicineList += `\n Medicine: ${E[i].MedicineName} \t \t \t \t Expiry Date: ${E[i].ExpiryDate} \n`;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '22h51a0558@cmrcet.ac.in',
        pass: 'taup whzo meke bbjv',
    },
    tls:{
      rejectUnauthorized:false
    }
  });
  let emailoptions={
   from:'22h51a0558@cmrcet.ac.in',
   to:data.UserId,
   subject:"MediAlert",
   text:`Dear user, \n \tyou have submitted the folowing medicines along with their expiry dates\n ${formattedMedicineList}`
  }
  transporter.sendMail(emailoptions,(error)=>{
    if(error)
      {
        res.status(500).send("Error sending message");
        console.log(" error sending email");
        console.log(error);
      }
      else
    {
       res.send("Message sent successfully");
       console.log("Message sent successfully");
    }
  })
})
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
          return res.redirect('/Patient_registered_Successfully.html');
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
  app.get('/showusermedicine',async(req,res)=>{
    try
  {
    const login= mdb1.collection('Login')
    const total = await login.countDocuments();
    const documents = await login.find({}).toArray();
    const docid = documents[total - 1].Userid;
    const col= await mdb.collection('Registered_User_medicinedata').find({"UserId":docid}).toArray();
  res.json(col);
  }
 catch(error)
 {
  res.status(500).json({error: error.message});
 }
  })
  cron.schedule('45 * * * * *',async ()=>{
    const today = new Date();
    console.log(today);
    const col= mdb1.collection('Login')
    const total = await col.countDocuments();
    const documents = await col.find({}).toArray();
    const docid = documents[total - 1].Userid;
    var E=await mdb.collection('Registered_User_medicinedata').find({"UserId":docid}).toArray()
  const filteredMedicine60 =E.filter(medicine => {
    const expiry = new Date(medicine.ExpiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  });
  const filteredMedicine30 = E.filter(medicine => {
    const expiry = new Date(medicine.ExpiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30  && diffDays > 0;
  });
  const filteredMedicine01 =E.filter(medicine => {
    const expiry = new Date(medicine.ExpiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays ===1;
  });
  const filteredMedicine00 = E.filter(medicine => {
    const expiry = new Date(medicine.ExpiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0;
  });
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '22h51a0558@cmrcet.ac.in',
        pass: 'taup whzo meke bbjv',
    },
    tls:{
      rejectUnauthorized:false
    }
  });
  const createEmailContent = (medicines, days) => {
    if (medicines.length > 0) {
      return `${medicines.map(med => `Medicine: ${med.MedicineName} \t \t \t \t Expiry Date: ${med.ExpiryDate}`).join('\n')}\n\n`;
    }
    return 'None of the medicines found';
  };
  const emailContent60 = createEmailContent(filteredMedicine60, 60)
  const emailContent30 = createEmailContent(filteredMedicine30, 30)
  const emailContent01 = createEmailContent(filteredMedicine01, 1)
  const emailContent00 = createEmailContent(filteredMedicine00, 0);
  let emailOptions = [{
    from: '22h51a0558@cmrcet.ac.in',
    to: docid,
    subject: "Medicine Expiry Reminder",
    text: `Dear User \n,\n\nHere are your medicines that will expiry in less than 60 days:\n\n${emailContent60}`
  },
  {
    from: '22h51a0558@cmrcet.ac.in',
    to: docid,
    subject: "Medicine Expiry Reminder",
    text: `Dear User \n,\n\nHere are your medicines that will expiry in less than 30 days:\n\n${emailContent30}`
  },
  {
    from: '22h51a0558@cmrcet.ac.in',
    to: docid,
    subject: "Medicine Expiry Reminder",
    text: `Dear User \n,\n\nHere are your medicine that are going to expire tomorrow:\n\n${emailContent01}`
  },
  {
    from: '22h51a0558@cmrcet.ac.in',
    to: docid,
    subject: "Medicine Expiry Reminder",
    text: `Dear User \n,\n\nHere are your medicine that have expired:\n\n${emailContent00}`
  }]
  for(var i=0;i< emailOptions.length;i++)
  {
   transporter.sendMail( emailOptions[i],(error)=>{
    if(error)
      {
        res.status(500).send("Error sending message");
        console.log(" error sending email");
        console.log(error);
      }
      else
    {
       res.send("Message sent successfully");
       console.log("Message sent successfully");
    }
  })
 }
})
const port=5050
app.listen((port),(req,res)=>{
 console.log(`Server is running on port ${port}`);
})