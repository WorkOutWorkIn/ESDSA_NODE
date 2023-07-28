const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "038570b9e0a454f6b87e6ecf2041515561d677d83df0482b5c65714a8d8e2669c6": 100,
  "028c9b6cceb14cf4f3aca2269a673bd6e4b9903f782089f2dada6a314de2649972": 50,
  "0276f1d94f93c84ec4a9208ee33d95269ef2249fec628c1d30a85afb2e3300f432": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // get a signature from client side app
  // recover the public address from the signature

  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

// validate and create new account if it does not exist
function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
