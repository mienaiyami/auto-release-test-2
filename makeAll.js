/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const {
    exec
} = require("child_process")
const pkgJSON = require("./package.json")

if (fs.existsSync("./out/full")) {
    fs.rmSync("./out/full/", {
        recursive: true
    })
}
fs.mkdirSync("./out/full")
const printProcessing = (string) => {
    let times = 0
    return setInterval(() => {
        times++
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(string + "".padEnd(times % 4, "."))
    }, 500);
    // console.log(`\x1b[31m${string} \x1b[0m`)
}
const makeExe = () => {
    fs.writeFileSync("./electron/IS_PORTABLE.ts", `
    const isPortable = false;
    export default isPortable;
    `)
    const a = printProcessing('making exe ')
    // console.log(`./out/make/squirrel.windows/ia32/Manga Reader-${pkgJSON.version} Setup.exe`)
    const yarnSpawn = exec("yarn makeExe")
    // yarnSpawn.stdout.on('data', (data) => {
    //     process.stdout.write(data)
    // });
    yarnSpawn.stderr.on('data', (data) => {
        process.stdout.write(`\x1b[91m${data}\x1b[0m`)
    });
    yarnSpawn.on('close', (code) => {
        clearInterval(a)
        console.log(`spawn yarn child process exited with code ${code}.`);
        if (fs.existsSync(`./out/make/squirrel.windows/ia32/Manga Reader-${pkgJSON.version} Setup.exe`)) {
            console.log("\x1b[92m.exe create successfully \x1b[0m")
            console.log("moving .exe ...")
            fs.rename(`./out/make/squirrel.windows/ia32/Manga Reader-${pkgJSON.version} Setup.exe`,
                `./out/full/Manga.Reader-${pkgJSON.version}-Setup.exe`, (err) => {
                    if (err) return console.error(err)
                    console.log("\x1b[92mmoved successfully. \x1b[0m")
                    makeZip()
                })
        } else {
            console.log("\x1b[91m.exe not found\x1b[0m")
        }
    });

}
const makeZip = () => {
    fs.writeFileSync("./electron/IS_PORTABLE.ts", `
    const isPortable = true;
    export default isPortable;
    `)
    const a = printProcessing("making zip ")
    // console.log(`./out/make/zip/win32/ia32/Manga.Reader-win32-${pkgJSON.version}-Portable.zip`)
    const yarnSpawn = exec("yarn makeZip")
    // yarnSpawn.stdout.on('data', (data) => {
    //     process.stdout.write(data)
    // });
    yarnSpawn.stderr.on('data', (data) => {
        process.stdout.write(`\x1b[91m${data}\x1b[0m`)
    });
    yarnSpawn.on('close', (code) => {
        clearInterval(a)
        console.log(`spawn yarn child process exited with code ${code}.`);
        if (fs.existsSync(`./out/make/zip/win32/ia32/Manga Reader-win32-ia32-${pkgJSON.version}.zip`)) {
            console.log("\x1b[92m.zip create successfully\x1b[0m")
            console.log("moving .zip...")
            fs.rename(`./out/make/zip/win32/ia32/Manga Reader-win32-ia32-${pkgJSON.version}.zip`,
                `./out/full/Manga.Reader-win32-${pkgJSON.version}-Portable.zip`, (err) => {
                    if (err) return console.error(err)
                    console.log("\x1b[92mmoved successfully.\x1b[0m")
                    fs.writeFileSync("./electron/IS_PORTABLE.ts", `
                    const isPortable = false;
                    export default isPortable;
                    `)
                })
        } else {
            console.log("\x1b[91m.zip not found\x1b[0m")
        }
    });

}
makeExe()