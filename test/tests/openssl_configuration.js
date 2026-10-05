/* jshint esversion: 11 */
var assert = require("assert");

describe("OpenSSL mirror configuration", function() {
  it("uses the selected OpenSSL mirror for checksum downloads", async function() {
    const options = (await import("../../utils/acquireOpenSSL.mjs")).getOpenSSLDownloadOptions;
    const url = "https://mirror.example/openssl.tar.gz?token=example";
    assert.deepStrictEqual(options(url, {}), {
      downloadBinUrl: url,
      maybeDownloadSha256Url: "https://mirror.example/openssl.tar.gz.sha256?token=example"
    });
    assert.deepStrictEqual(options(url, { npm_config_openssl_bin_sha256: "digest" }), {
      downloadBinUrl: url, maybeDownloadSha256: "digest"
    });
    assert.deepStrictEqual(options(url, { npm_config_openssl_bin_sha256: "skip" }), {
      downloadBinUrl: url
    });
  });

});
