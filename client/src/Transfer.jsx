import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

// Private Key: 643d783c9025ac3740ee3486a52cddf55baabd6d2aa402263967e1f35fe4817a
// Public Key: 038570b9e0a454f6b87e6ecf2041515561d677d83df0482b5c65714a8d8e2669c6

// Private Key: 24d82a173dad280fd8265ffad184bcf4e96db8e3d240b602334b859130a1491a
// Public Key: 0276f1d94f93c84ec4a9208ee33d95269ef2249fec628c1d30a85afb2e3300f432

// Private Key: 13915bf092c02a2811c9d55dd4182fd14fd10ee4b07de167d30145d3c349ff8c
// Public Key: 028c9b6cceb14cf4f3aca2269a673bd6e4b9903f782089f2dada6a314de2649972

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  // setting value from the input field
  const setValue = (setter) => (evt) => setter(evt.target.value);

  // functions to get signature
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  const signMessage = (msg) => secp256k1.sign(hashMessage(msg), privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(msg);
    console.log(sig);

    const stringifyBigInts = (obj) => {
      for (let prop in obj) {
        let value = obj[prop];
        if (typeof value === "bigint") {
          obj[prop] = value.toString();
        } else if (typeof value === "object" && value !== null) {
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    };

    //stringify bigints before sending to server
    const sigStringed = stringifyBigInts(sig);

    // content for POST req
    const tx = {
      sig: sigStringed,
      msg,
      sender: address,
    };

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        tx,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
