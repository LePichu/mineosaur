export type XMLNode = {
    tag: string;
    sub: (XMLNode|string)[];
    keys: {
        [key: string]: string
    };
    close: boolean;
}

export type XMLDoc = {
    type: string;
    root: XMLNode;
}