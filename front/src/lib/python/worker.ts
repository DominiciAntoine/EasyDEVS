import type { WorkerResponse } from "@/types";

// @ts-ignore
importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js");

let working = false;
async function loadPyodideAndRun(code: string): Promise<WorkerResponse> {
	working = true;
	let pyodide;
	try {
		pyodide = await loadPyodide();
		await pyodide.loadPackage(["micropip"]);
		const micropip = pyodide.pyimport("micropip");
		await micropip.install("pyright");

		// Utiliser Pyright pour le linting
		const pyright = pyodide.pyimport("pyright");
		const diagnostics = pyright.runLinter(code);

		return { diagnostics, error: "No error" };
	} catch (error) {
		return { diagnostics: [], error: error };
	} finally {
		// Libérer la mémoire si possible
		pyodide = null;
		working = false;
	}
}

self.onmessage = async (event: MessageEvent<{ code: string }>) => {
	const { code } = event.data;
	if (!working) {
		const response = await loadPyodideAndRun(code);
		self.postMessage(response);
	}
};
