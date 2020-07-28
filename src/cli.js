const axios = require("axios");

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
      console.log("Error while uploading diff, try again later");
      return;
    }

    printDocument(documentUrl, encryptionKey);
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
  console.log("You need to pipe a git diff into reviewpls");
  console.log('Something like "git diff | reviewpls"');
}

function randomEncryptionKey() {
  return "exampleRandomEncryptionKey";
}

function encryptContent(content, encryptionKey) {
  return content;
}

async function upload(encryptedContent) {
  console.log(`"BASE_API : ${BASE_API_URL}`);
  console.log(`"NODE_ENV : ${process.env.NODE_ENV}`);
  const response = await axios.post(`${BASE_API_URL}/api/documents`, {
    some: "params",
  });

  return response.data.url;
}

function printDocument(documentUrl, encryptionKey) {
  console.log("Git diff uploaded to reviewpls");
  console.log("");
  console.log("You can access your file using the following:");
  console.log(`URL: ${documentUrl}`);
  console.log(`Password: ${encryptionKey}`);
  console.log("");
  console.log("or directly through:");
  console.log("");
  console.log(`${documentUrl}#${encryptionKey}`);
}

module.exports = {
  run,
};
