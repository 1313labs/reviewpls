const axios = require("axios");

function getApiUrl(args) {
  let base_url = "http://reviewpls.1313labs.com/api";
  if (args.includes("--dev")) {
    base_url = "http://localhost:3000/api";
  }
  return base_url;
}

async function upload(encryptedContent, apiUrl) {
  const headers = { headers: { "Content-Type": "application/json" } };
  const payload = {
    document: {
      encrypted_object: {
        content_type: "text/plain",
        data: encryptedContent,
      },
    },
  };

  const response = await axios.post(`${apiUrl}/documents`, payload, headers);
  return response.data.url;
}

module.exports = {
  getApiUrl,
  upload,
};
