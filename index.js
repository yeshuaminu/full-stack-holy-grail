var express = require("express");
const redis = require("redis");
const { promisify } = require("util");

var app = express();

//TODO: create a redis client
const client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.set("header", 0, redis.print);
client.set("left", 0, redis.print);
client.set("right", 0, redis.print);
client.set("article", 0, redis.print);
client.set("footer", 0, redis.print);

// Get values for holy grail layout
async function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  // const getAsync = promisify(client.get).bind(client);
  // return {
  //   header: await getAsync("header"),
  //   left: await getAsync("left"),
  //   right: await getAsync("right"),
  //   article: await getAsync("article"),
  //   footer: await getAsync("footer"),
  // }
  const getAsync = promisify(client.mget).bind(client);
  const values = await getAsync(["header", "left", "right", "article", "footer"])
  const [header, left, right, article, footer] = values
  return {
      header: Number(header),
      left: Number(left),
      right: Number(right),
      article: Number(article),
      footer: Number(footer),
    }
}

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  //TODO: use the redis client to update the value associated with the given key
  client.get(key, (error, currentValue) => {
    client.set(key, Number(currentValue) + value, () => {
      data().then((data) => {
        console.log(data);
        res.send(data);
      });
    });
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(8000, () => {
  console.log("Running on 8000");
});

process.on("exit", function () {
  client.quit();
});
