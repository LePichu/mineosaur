import { parseXml } from "./XmlProcessor.ts";
import { parseXon } from "./XonProcessor.ts";
import { XMLDoc, XMLNode } from "./types.ts";

export default class XonParser {

    constructor() {

    }

    public parse(input: string, isXml: boolean = false): string {
        if (isXml) return this.parseXml(input);
        return this.parseXon(input);
    }

    private parseXml(input: string): string {
        let xml = parseXml(input);
        if (!xml) return "";
        let root = xml.root;
        
        return ((xml.type??"") + "\n" + this.convertToXon(root)).trim();
    }

    private convertToXon(root: XMLNode, indent: string = ""): string {
        let output = "";
        if (!root.tag) return "";
        output += root.tag + " ";
        if (root.keys)
            for (let key in root.keys)
                output += key + "=\"" + root.keys[key] + "\" ";
        if (root.sub) {
            if (root.sub.length == 1 && typeof root.sub[0] == "string")
                output += "\"" + root.sub[0] + "\"";
            else {
                output += "{\n";
                for (let sub of root.sub) {
                    if (typeof sub == "string") output += indent + "  \"" + sub + "\"\n";
                    else output += this.convertToXon(sub, indent + "  ");
                }
                output += "\n"+indent+"}";
            }
        }
        if (root.close) output = "/" + output + "\n";
        return indent + output;
    }

    private parseXon(input: string): string {
        let xon = parseXon(input);
        if (!xon) return "";
        let type = "";
        if (xon.type) type = `<!doctype ${xon.type}>\n`;
        return type + this.convertToXml(xon.root);
    }

    private convertToXml(root: XMLNode, indent: string = "") {
        let output = "";
        if (!root.tag) return "";
        output += "<" + root.tag;
        if (root.keys)
            for (let key in root.keys)
                output += " " + key + "=\"" + root.keys[key] + "\"";
        if (root.close) {
            output += "/>";
            return output;
        }
        output += ">\n";
        if (root.sub) {
            for (let sub of root.sub) {
                output += "  ";
                if (typeof sub == "string") output += indent + sub.trim() + "\n";
                else output += indent + this.convertToXml(sub, indent + "  ") + "\n";
            }
            output + "\n";
        }
        output += indent + "</"+root.tag+">";
        return output;

    }
}