import type { UserConfig, ResolveOptions, BuildOptions } from 'vite'

export class RawValue {
    value: string;
    constructor (val: string) {
      this.value = val
    }

    public toString (): string {
      return this.value
    }
}

export declare interface Alias {
  find: RawValue | string;
  replacement: RawValue | string;
}

export declare interface Build extends Omit<BuildOptions, 'outDir'> {
  outDir?: string | RawValue
}

export declare interface ViteConfig
    extends Omit<UserConfig, 'plugins' | 'resolve' | 'build'> {
    plugins?: RawValue[];

    resolve?: ResolveOptions & {
        alias?: Alias[];
    };
    build?: Build
}
