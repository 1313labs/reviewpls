const _sodium = require("libsodium-wrappers");

let sodium;

const getLibsodium = async () => {
  if (!sodium) {
    await _sodium.ready;
    sodium = _sodium;
  }
  return sodium;
};

const getNonceByteLength = async () => {
  const sodium = await getLibsodium();
  return sodium.crypto_secretbox_NONCEBYTES;
};

async function randomEncryptionKey() {
  const sodium = await getLibsodium();
  return sodium.to_hex(
    sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
  );
}
async function randomNonce() {
  const sodium = await getLibsodium();
  const nonce = sodium.randombytes_buf(await getNonceByteLength());
  const nonceHex = sodium.to_hex(nonce);
  return [nonce, nonceHex];
}

async function encryptContent(unencryptedString, randomEncryptionKey) {
  const sodium = await getLibsodium();

  let [nonce, nonceHex] = await randomNonce();
  const encryptionKeyArray = sodium.from_hex(randomEncryptionKey);

  const encryptedString = sodium.crypto_secretbox_easy(
    unencryptedString,
    nonce,
    encryptionKeyArray
  );

  return nonceHex.concat(sodium.to_hex(encryptedString));
}

async function splitEncryptedString(encryptedString) {
  const sodium = await getLibsodium();
  const nonceAndCiphertext = sodium.from_hex(encryptedString);
  const nonceByteLength = await getNonceByteLength();

  return [
    nonceAndCiphertext.slice(0, nonceByteLength),
    nonceAndCiphertext.slice(nonceByteLength),
  ];
}

const getMacByteLength = async () => {
  const sodium = await getLibsodium();
  return sodium.crypto_secretbox_MACBYTES;
};

async function decryptContent(nonceAndCiphertext, encryptionKey) {
  const sodium = await getLibsodium();
  const minimumEncryptedStringLengtht =
    (await getNonceByteLength()) + (await getMacByteLength());

  if (nonceAndCiphertext.length < minimumEncryptedStringLengtht) {
    throw new Error("This message is too short to be decrypted.");
  }

  const [nonce, ciphertext] = await splitEncryptedString(nonceAndCiphertext);
  const encryptionKeyArray = sodium.from_hex(encryptionKey);

  const unencryptedContent = sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    encryptionKeyArray
  );

  return sodium.to_string(unencryptedContent);
}

module.exports = {
  randomEncryptionKey,
  encryptContent,
  decryptContent,
};
