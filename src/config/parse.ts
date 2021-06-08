import fs from "fs";
import { WebpackConfig } from "./webpack";
import { VueCliConfig } from "./vuecli";

export async function parseWebpackConfig(
    configPath: string
): Promise<WebpackConfig> {
    let webpackConfig: WebpackConfig = {};
    await import(configPath).then((config) => {
        webpackConfig = config;
    });
    return webpackConfig;
}

export async function parseVueCliConfig(
    configPath: string
): Promise<VueCliConfig> {
    let vueCliConfig: VueCliConfig = {};
    if (fs.existsSync(configPath)) {
        await import(configPath).then((config) => {
            vueCliConfig = config;
        });
    }
    return vueCliConfig;
}
