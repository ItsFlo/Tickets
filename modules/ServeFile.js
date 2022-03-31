import { extname } from "path";
import { readFile } from "fs";
import { sendStatus } from "./HttpDispatcher.js";

const MIME_TYPES = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".pdf": "application/pdf",
	".woff": "application/font-woff",
	".ttf": "application/font-ttf",
	".eot": "application/vnd.ms-fontobject",
	".otf": "application/font-otf",
	".wasm": "application/wasm",
	".png": "image/png",
	".jpg": "image/jpg",
	".ico": "image/x-icon",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".wav": "audio/wav",
	".mp3": "audio/mpeg",
	".mp4": "video/mp4",
}

function serveFile(sFilePath, response, mimeType) {
	if(!mimeType) {
		let sFileExtension = extname(sFilePath).toLowerCase();
		mimeType = MIME_TYPES[sFileExtension] || "application/octet-stream";
	}

	readFile(sFilePath, (err, sContent) => {
		if(err) {
			if(err.code == "ENOENT") {
				response.setHeader("Cache-Control", "public, max-age=31536000");
				sendStatus(response, 404);
			}
			else {
				sendStatus(response, 500);
			}
		}
		else {
			response.setHeader("Cache-Control", "public, max-age=86400");
			response.setHeader("Content-Type", mimeType);
			response.writeHead(200);
			response.end(sContent);
		}
	});
}

export default serveFile;
