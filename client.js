const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { exec } = require("child_process");

module.exports = function(serveStatic) {
	const server = new WebSocket.Server({ port: 8080 });

	server.on('connection', (socket) => {
		socket.on('message', (message) => {
			const msg = JSON.parse(message);
			if (msg.type === 'translate') {
				exec(`trans :pt "${msg.text}"`, (error, stdout, stderr) => {
					socket.send(JSON.stringify({
						type: 'translate',
						text: stdout
					}));
				})
			} else if (msg.type === 'send') {
				let path_images = msg.folder_images.split('/');
				const popped_images = path_images.pop();
				path_images = path_images.join('/');

				serveStatic(path_images);

				const files = glob.sync(path.join(escapePath(msg.folder_images), '*'));
				const images = files.map(file=> file.split('/')[file.split('/').length - 1]);

				images.sort((a,b) => {
					a = a.replace(/\.(png|jpg)/, '');
					b = b.replace(/\.(png|jpg)/, '');
					return a - b;
				});

				const has_text = fs.existsSync(path.join(msg.folder_traducao, 'Tradução'));
				let text;

				if (has_text) {
					text = fs.readFileSync(path.join(msg.folder_traducao, 'Tradução'), 'utf8');
				}

				socket.send(JSON.stringify({
					type: 'images',
					images: images,
					popped_images: popped_images,
					has_text: has_text,
					text: text
				}));
			} else if (msg.type === 'save') {
				fs.writeFile(path.join(msg.folder_traducao, 'Tradução'), msg.text, err => {
					if (err) {
						socket.send(JSON.stringify({
							type: 'error',
							message: err
						}));
						return;
					}
					socket.send(JSON.stringify({
						type: 'message',
						message: "Saved"
					}));
				});
			}
		});

		socket.on('close', ()=> {
		});
	});
}

function escapePath(path) {
	return path.replace(/(\[|\])/g, '[\\$&]');
}