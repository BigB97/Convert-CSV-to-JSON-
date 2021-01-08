const express = require("express");
const cors = require("cors");
const getCSV = require("get-csv");
const csv = require("csvtojson");
const cryptoRandomString = require("crypto-random-string");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/csv", async (req, res) => {
  // generated random identifier
  const conversion_key = cryptoRandomString({ length: 20, type: "base64" });

  // Get csv body from client side
  const csvInfo = req.body.csv;
  // check if is sent and properly sent
  if (!csvInfo || !csvInfo.url || !csvInfo.select_fields)
    return res.status(400).json({
      message:
        "Your csv file is not found or not properly sent, kindly recheck!",
    });

  // Get extension of url to know if file is valid
  const getExtention = csvInfo.url.split(/[#?]/)[0].split(".").pop().trim();
  if (getExtention !== "csv")
    return res.status(404).json({
      message:
        "This url those doesn't contain a valid CSV file,it most end with .CSV extension ",
    });

  // Convert CSV to JSON & push to new array, the fields specified in the "select_fields" parameter

  // create empty arry for final output
  const result = [];
  //  convert csv url to json
  const convertoCsv = await getCSV(csvInfo.url).then((rows) => {
    // filter array to find " specified fields"
    const found = rows.filter((element) => {
      const filtered = Object.keys(element)
        .filter((key) => csvInfo.select_fields.includes(key))
        .reduce((obj, key) => {
          obj[key] = element[key];
          return obj;
        }, {});
      result.push(filtered);
    });
    return rows;
  }, Object.create(null));

  // after searching the CSV file for the "specified fields", check if it is found
  const isNotFound = Object.entries(result[0]).length === 0;
  if (isNotFound)
    return res.status(200).json({
      message: `"${csvInfo.select_fields}" Not found`,
      conversion_key,
      Json: convertoCsv,
    });
  return res.status(200).json({
    message: "Success",
    conversion_key,
    Json: result,
  });
});

// PORT,
app.listen(3000, () => console.log("app listening on port 3000!"));
