export declare class FileTemplate extends Map<string, string> {
    from: string;
    constructor(from: string, format: FileTemplate.Format);
    substitute(key: string, mappings: {
        token: string;
        value: string;
    }[]): string;
}
export declare namespace FileTemplate {
    enum Format {
        YAML = 0,
        JSON = 1
    }
}
//# sourceMappingURL=common-generator.d.ts.map