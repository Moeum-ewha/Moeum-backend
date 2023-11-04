const jose = require("jose");
const { writeFile } = require("node:fs/promises");

(async () => {
    const [accessKeys, refreshKeys] = await Promise.all([
        jose.generateKeyPair("ES256", { extractable: true, modulusLength: 4096 }),
        jose.generateKeyPair("ES256", { extractable: true, modulusLength: 4096 }),
    ]);
    
    await Promise.all([
        writeFile("private-access.ec.key", await jose.exportPKCS8(accessKeys.privateKey), { encoding: 'utf-8' }),
        writeFile("public-access.ec.pem", await jose.exportSPKI(accessKeys.publicKey), { encoding: 'utf-8' }),
        writeFile("private-refresh.ec.key", await jose.exportPKCS8(refreshKeys.privateKey), { encoding: 'utf-8' }),
        writeFile("public-refresh.ec.pem", await jose.exportSPKI(refreshKeys.publicKey), { encoding: 'utf-8' }),
    ]);
    
    console.log("Keys created at: " + __dirname);
})();
