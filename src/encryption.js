const _sodium = require("libsodium-wrappers");

async function randomEncryptionKey() {
  await _sodium.ready;
  const sodium = _sodium;
  return sodium.to_hex(
    sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
  );
}

async function encryptContent(content, randomEncryptionKey) {
  await _sodium.ready;
  const sodium = _sodium;
  let nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  let nonce_arr = sodium.to_hex(nonce);

  return nonce_arr.concat(
    sodium.to_hex(
      sodium.crypto_secretbox_easy(
        content,
        nonce,
        sodium.from_hex(randomEncryptionKey)
      )
    )
  );
}

async function decryptContent(nonce_and_ciphertext, key) {
  await _sodium.ready;
  const sodium = _sodium;
  if (
    nonce_and_ciphertext.length <
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES
  ) {
    throw "Short message";
  }
  let nonce = sodium
    .from_hex(nonce_and_ciphertext)
    .slice(0, sodium.crypto_secretbox_NONCEBYTES);
  let ciphertext = sodium
    .from_hex(nonce_and_ciphertext)
    .slice(sodium.crypto_secretbox_NONCEBYTES);
  return sodium.to_string(
    sodium.crypto_secretbox_open_easy(ciphertext, nonce, sodium.from_hex(key))
  );
}

module.exports = {
  randomEncryptionKey,
  encryptContent,
  decryptContent,
};
