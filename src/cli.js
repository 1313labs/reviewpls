const log = console.log;
const { randomEncryptionKey, encryptContent } = require("./encryption");
const { upload, getApiUrl } = require("./api");

function run(args) {
  let content = "";
  const apiUrl = getApiUrl(args);

  async function onStreamEnded() {
    if (content === "") {
      return printInstructions();
    }
    log("Creating encryption key...");
    const encryptionKey = await randomEncryptionKey();

    log("Encrypting your diff...");
    const encryptedContent = await encryptContent(content, encryptionKey);

    let documentUrl;
    try {
      log("Sending encrypted diff to our backend...");
      documentUrl = await upload(encryptedContent, apiUrl);
    } catch (_error) {
      log("Error while uploading diff, try again later");
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
  log("You need to pipe a git diff into reviewpls");
  log('Something like "git diff | reviewpls"');
}

function printDocument(documentUrl, encryptionKey) {
  log("Diff successfully uploaded to reviewpls!");
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
