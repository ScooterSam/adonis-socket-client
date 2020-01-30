import Client from './Client.js';

let client = new Client();
client.connect();

client.on('open', () => {

	let subscription = client.subscribe('user:9');

	subscription.on('test', (socket, data) => {
		socket.send('sample', {isSample : true});
	});
	subscription.on('new-event', (socket, data) => {
		console.log('new event received, pog.');
	});

});
