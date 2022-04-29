export type Position = [number, number, number];


export type VanillaColor = "black" | "dark_blue" | "dark_green" | "dark_aqua" | "dark_red" | "dark_purple" | "gold" | "gray" | "dark_gray" | "blue" | "green" | "aqua" | "red" | "light_purple" | "yellow" | "white";

export type Identifier = `${string}:${string}` | string;

type Hex = '0' | '1' | '2'| '3'| '4'| '5'| '6'| '7'| '8'| '9'| 'a'| 'b'| 'c'| 'd'| 'e'| 'f'| 'A'| 'B'| 'C'| 'D'| 'E'| 'F';

interface TextBase {
	extra?: Text[];
	color?: VanillaColor | string;
	font?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	obfustated?: boolean;
	insertion?: string;
	clickEvent?: {
		action: "open_url" | "run_command" | "suggest_command" | "change_page" | "copy_to_clipboard",
		value: string;
	}
	hoverEvent?: {
		action: "show_text",
		contents: string;
	} | {
		action: "show_item",
		contents: {
			id: string;
			count: number;
			tag?: string;
		};
	} | {
		action: "show_entity",
		contents: {
			type: string;
			id: string;
			name?: Text;
		};
	}
}


export type Text = TextBase & ({text: string} | {translate: string, with?: Text[]} | {keybind: string});