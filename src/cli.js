const axios = require("axios");
const uuid = require("uuid");
const forge = require("node-forge");
const log = console.log;

let BASE_API_URL = "http://reviewpls.1313labs.com/api";

function run(args) {
  let content = "";

  if (args.includes("--dev")) {
    BASE_API_URL = "http://localhost:3000/api";
  }

  async function onStreamEnded() {
    if (content === "") {
      return printInstructions();
    }

    const encryptionKey = randomEncryptionKey();
    const encryptedContent = encryptContent(content, encryptionKey);

    let documentUrl;
    try {
      documentUrl = await upload(encryptedContent);
    } catch (_error) {
      log("Error while uploading diff, try again later");
      return;
    }

    printDocument(documentUrl, forge.util.bytesToHex(encryptionKey));
  }

  const onDataReceived = (chunk) => {
    content += chunk;
  };

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", onDataReceived);
  process.stdin.on("end", onStreamEnded);

  setTimeout(() => {
    if (content !== "") {
      return;
    }

    process.stdin.emit("end");
  }, 100);
}

function printInstructions() {
  log("You need to pipe a git diff into reviewpls");
  log('Something like "git diff | reviewpls"');
}

function randomEncryptionKey() {
  return forge.random.getBytesSync(16);
}

function encryptContent(content, encryptionKey) {
  let iv = forge.random.getBytesSync(16);
  let cipher = forge.cipher.createCipher("AES-CBC", encryptionKey);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(content));
  cipher.finish();
  return [iv, cipher.output.data]
    .map((item) => forge.util.bytesToHex(item))
    .reduce((accumulator, hexStr) => accumulator + hexStr);
}

function decryptContent(IVEncryptedContentString, encryptionKey) {
  let [iv, encryptedContent] = splitEncryptedString(IVEncryptedContentString);
  let decipher = forge.cipher.createDecipher(
    "AES-CBC",
    forge.util.hexToBytes(encryptionKey)
  );
  decipher.start({ iv });
  decipher.update(encryptedContent);
  let result = decipher.finish();
  if (!result) {
    throw Error("There was an error decrypting your file.");
  }
  return decipher.output.toString();
}

function splitEncryptedString(encryptedContent) {
  return [
    encryptedContent.substring(0, 32),
    encryptedContent.substring(32),
  ].map(
    (string) => new forge.util.ByteStringBuffer(forge.util.hexToBytes(string))
  );
}

async function upload(encryptedContent) {
  const headers = { headers: { "Content-Type": "application/json" } };
  const payload = {
    document: {
      uuid: uuid.v4(),
      encrypted_object: {
        content_type: "text/plain",
        data: encryptedContent,
      },
    },
  };

  const response = await axios.post(
    `${BASE_API_URL}/documents`,
    payload,
    headers
  );

  return response.data.url;
}

function printDocument(documentUrl, encryptionKey) {
  log("Git diff uploaded to reviewpls");
  log("");
  log("You can access your file using the following:");
  log(`URL: ${documentUrl}`);
  log(`Password: ${encryptionKey}`);
  log("");
  log("or directly through:");
  log("");
  log(`${documentUrl}#${encryptionKey}`);
}

module.exports = {
  run,
};
