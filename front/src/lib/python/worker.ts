// @ts-ignore
importScripts("https://cdn.jsdelivr.net/npm/pyright-wasm");

let pyright = null;

async function initPyright() {
	pyright = await pyright.createFromCDN();
	postMessage({ type: "ready" });
}

initPyright();

self.onmessage = async (event) => {
	if (!pyright) {
		postMessage({ type: "error", message: "Pyright is not ready." });
		return;
	}

	const { code, action, position } = event.data;

	if (action === "lint") {
		const diagnostics = pyright.analyze(code, {});

		const markers = diagnostics.map((diag) => ({
			message: diag.message,
			line: diag.range.start.line + 1,
			column: diag.range.start.character + 1,
			severity: diag.severity === "error" ? 8 : 4, // 8 = Error, 4 = Warning
		}));

		postMessage({ type: "lint", markers });
	}

	if (action === "complete") {
		const suggestions = pyright.getCompletions(code, position);
		postMessage({ type: "completion", suggestions });
	}

	if (action === "hover") {
		const hoverInfo = pyright.getHover(code, position);
		postMessage({ type: "hover", hoverInfo });
	}
};
