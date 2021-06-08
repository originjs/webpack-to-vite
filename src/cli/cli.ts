import path from "path";
import fs from "fs";
import { genIndexHtml } from "../generate/geneIndexHtml";
import { genePackageJson as genPackageJson } from "../generate/genePackageJson";
import { geneViteConfig } from "../generate/geneViteConfig";
import { Command } from "commander";
import { Config } from "../config/config";

export function run() {
    const program = new Command();
    program
        .version("0.0.1")
        .option("--rootDir <path>", "the directory of project to be transfered")
        .parse(process.argv);

    const keys = ['rootDir'];
    const config: Config = {};
    keys.forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(program.opts(), k)) {
            config[k] = program.opts()[k];
        }
    });
    start(config.rootDir);
}

export function start(rootDir: string) {
    console.log("******************* Webpack to Vite *******************");
    console.log(`project path: ${rootDir}`);

    const cwd = process.cwd();
    if (!fs.existsSync(rootDir)) {
        console.error(`project path is not correct : ${rootDir}`);
        return;
    }

    rootDir = path.resolve(rootDir);

    //TODO:how to deal with the index.html in the project,
    //notice that this will not choose the root directory in non-vite projects
    genIndexHtml(rootDir);

    genPackageJson(path.resolve(rootDir, "package.json"));

    geneViteConfig(path.resolve(rootDir, "vue.config.js"), rootDir);

    console.log("************************ Done ! ************************");
    const pkgManager = fs.existsSync(path.resolve(rootDir, "yarn.lock"))
        ? "yarn"
        : "npm";

    console.log("Now please run:\n");
    if (rootDir !== cwd) {
        console.log(`cd ${path.relative(cwd, rootDir)}`);
    }

    console.log(`${pkgManager == "yarn" ? "yarn" : "npm install"}`);
    console.log(
        `${pkgManager === "yarn" ? "yarn serve-vite" : "npm run serve-vite"}`
    );
    console.log();
}
