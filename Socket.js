import Emitter from './node_modules/emitter-js/dist/emitter.js';
import Packets from './Packets.js';

export default class Socket {

	constructor(topic, connection)
	{
		this._topic      = topic;
		this._connection = connection;
		this._emitter    = new Emitter();
	}

	emit(event, data)
	{
		this._emitter.emit(event, data);
	}

	on(event, cb)
	{
		this._emitter.on(event, data => {
			cb(this, data);
		});
	}

	send(event, data)
	{
		this._connection.sendPacket(Packets.EVENT, {
			topic : this._topic,
			event : event,
			data  : data,
		});
	}

};