// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import pyrightCDN from "pyright-wasm";

type Pyright = {
	analyze: (code: string, options?: object) => Diagnostic[];
	getCompletions: (code: string, position: Position) => CompletionItem[];
	getHover: (code: string, position: Position) => string | null;
};

type Position = { line: number; character: number };

type Diagnostic = {
	message: string;
	range: { start: Position; end: Position };
	severity: "error" | "warning";
};

type CompletionItem = {
	label: string;
	insertText: string;
	kind: "function" | "class" | "variable";
};

type WorkerMessage =
	| { type: "ready" }
	| { type: "error"; message: string }
	| { type: "lint"; markers: Marker[] }
	| { type: "completion"; suggestions: CompletionItem[] }
	| { type: "hover"; hoverInfo: string | null };

type Marker = {
	message: string;
	line: number;
	column: number;
	severity: number;
};

let pyrightInstance: Pyright | null = null;

async function initPyright() {
	pyrightInstance = await pyrightCDN.createFromCDN();
	postMessage({ type: "ready" } satisfies WorkerMessage);
}

initPyright();

self.onmessage = async (
	event: MessageEvent<{
		code: string;
		action: "lint" | "complete" | "hover";
		position?: Position;
	}>,
) => {
	if (!pyrightInstance) {
		postMessage({
			type: "error",
			message: "Pyright is not ready.",
		} satisfies WorkerMessage);
		return;
	}

	const { code, action, position } = event.data;

	if (action === "lint") {
		const diagnostics = pyrightInstance.analyze(code, {});
		const markers: Marker[] = diagnostics.map((diag) => ({
			message: diag.message,
			line: diag.range.start.line + 1,
			column: diag.range.start.character + 1,
			severity: diag.severity === "error" ? 8 : 4, // 8 = Error, 4 = Warning
		}));

		postMessage({ type: "lint", markers } satisfies WorkerMessage);
	}

	if (action === "complete" && position) {
		const suggestions = pyrightInstance.getCompletions(code, position);
		postMessage({ type: "completion", suggestions } satisfies WorkerMessage);
	}

	if (action === "hover" && position) {
		const hoverInfo = pyrightInstance.getHover(code, position);
		postMessage({ type: "hover", hoverInfo } satisfies WorkerMessage);
	}
};
