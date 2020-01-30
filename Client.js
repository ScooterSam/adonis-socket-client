import Emitter from './node_modules/emitter-js/dist/emitter.js';
import Socket  from './Socket.js';
import Packets from './Packets.js';

export default class Client {
	constructor()
	{
		this._socket          = null;
		this._pingTimer       = null;
		this._subscriptions   = [];
		this._connectionState = 'idle';

		/**
		 * @type {Emitter}
		 * @private
		 */
		this._emitter = new Emitter();
	}

	connect()
	{
		this._socket           = new WebSocket(`......`);
		this._socket.onopen    = (event) => this._onOpen(event);
		this._socket.onerror   = (event) => this._onError(event);
		this._socket.onclose   = (event) => this._onClose(event);
		this._socket.onmessage = (event) => this._onMessage(event);

		return this;
	}

	_onOpen(event)
	{
		console.log('Successfully connected to server.');
	}

	_onError(event)
	{

	}

	_onClose(event)
	{
		this._connectionState = 'idle';
	}

	_onMessage(event)
	{
		let data       = JSON.parse(event.data);
		let packetType = data.t;
		console.log('[PACKET]', data);

		switch (packetType) {
			case Packets.OPEN:
				console.log('Open packet received');
				this._connectionState = 'open';

				this.sendPacket(Packets.OPEN, data.d);

				this._pingTimer = setInterval(() => {
					this.sendPacket(Packets.PING);
				}, data.d.clientInterval);

				this._emitter.emit('open');
				return;
				break;

			case Packets.JOIN_ACK:
				console.log('JOIN_ACK packet received');

				return;
				break;

			case Packets.EVENT:
				console.log('JOIN_ACK packet received');
				let subscription = this.subscription(data.d.topic);

				if (!subscription) {
					console.log(`${data.d.topic} does not exist`);
				}

				subscription.emit(data.d.event, data.d.data);

				return;
				break;

			case Packets.PONG:
				//We don't need to do any thing with the pong packet,
				//if the server doesnt receive a PING it closes the connection
				return;
				break;
		}

	}

	sendPacket(packet, data = {})
	{
		this._socket.send(JSON.stringify({
			t : packet,
			d : data,
		}));
	}

	subscribe(topic)
	{
		if (this._subscriptions[topic]) return this._subscriptions[topic];

		this._subscriptions[topic] = new Socket(topic, this);

		this.sendPacket(Packets.JOIN, {topic : topic});

		return this._subscriptions[topic];
	}

	subscription(topic)
	{
		return this._subscriptions[topic];
	}

	on(event, cb)
	{
		this._emitter.on(event, cb);
	}
};
