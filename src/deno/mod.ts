import { Webview } from "https://deno.land/x/webview@0.7.0-pre.1/mod.ts";
import { XON } from "./xon/index.ts";

const html = XON.parse(await Deno.readTextFile("./src/client/index.xns"));

const webview = new Webview();
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.title = "Mineosaur Client"
webview.run();