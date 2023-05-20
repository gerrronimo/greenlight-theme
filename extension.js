const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const activate = () => {
	const isWindows = /^win/.test(process.platform);
	const appDir = path.dirname(require.main.filename);
	const base = appDir + (isWindows ? "\\vs\\code" : "/vs/code");
	const electronBase = isVSCodeBelowVersion("1.70.0") ? "electron-browser" : "electron-sandbox";
	const htmlPath = base + (isWindows
		? "\\" + electronBase + "\\workbench\\workbench.html"
		: "/" + electronBase + "/workbench/workbench.html");
	const html = fs.readFileSync(htmlPath, "utf-8");
	const code = `<!-- GREENLIGHT --><link href="${__dirname + '/green-light.css'}" rel="stylesheet">`;

	console.log(html);

	if (!html.includes(code)) {
		fs.writeFileSync(htmlPath, html.replace(/\<\/html\>/g, `${code}\n`) + '</html>', "utf-8");
		vscode.commands.executeCommand("workbench.action.reloadWindow");
		vscode.workspace.getConfiguration().update("editor.fontFamily", "Menlo, monospace");
	} else {
		if (!html.includes(`<!-- restarted -->`)) {
			fs.writeFileSync(htmlPath, html.replace(/\<\/html\>/g, `<!-- restarted -->\n`) + '</html>', "utf-8");
			vscode.commands.executeCommand("workbench.action.reloadWindow");
		} else {
			fs.writeFileSync(htmlPath, html.replace(`<!-- restarted -->\n`, ''), "utf-8");
		}

		return;
	}
}

const deactivate = () => {
	const isWindows = /^win/.test(process.platform);
	const appDir = path.dirname(require.main.filename);
	const base = appDir + isWindows ? "\\vs\\code" : "/vs/code";
	const electronBase = isVSCodeBelowVersion("1.70.0") ? "electron-browser" : "electron-sandbox";
	const htmlPath = base + isWindows
		? "\\" + electronBase + "\\workbench\\workbench.html"
		: "/" + electronBase + "/workbench/workbench.html";
	const html = fs.readFileSync(htmlPath, "utf-8");
	const code = `<!-- GREENLIGHT --><link href="${__dirname + '/green-light.css'}" rel="stylesheet">`

	if (html.includes(code)) {
		fs.writeFileSync(htmlPath, html.replace(code, ''), "utf-8");
		fs.writeFileSync(htmlPath, html.replace(`<!-- restarted -->\n`, ''), "utf-8");
		vscode.window
			.showInformationMessage("GreenLight is disabled. VS code must reload for this change to take effect", { title: "Restart editor to complete" })
			.then(() => vscode.commands.executeCommand("workbench.action.reloadWindow"));
	} else {
		return;
	}
}

const isVSCodeBelowVersion = (version) => {
	const vscodeVersion = vscode.version;
	const vscodeVersionArray = vscodeVersion.split('.');
	const versionArray = version.split('.');

	for (let i = 0; i < versionArray.length; i++) {
		if (vscodeVersionArray[i] < versionArray[i]) {
			return true;
		}
	}

	return false;
}

module.exports = {
	activate,
	deactivate
}
