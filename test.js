const client1 = new SEC('client1');
const client2 = new SEC('client2');
const client3 = new SEC('client3');

// client1 connect to client 2
client1.connect('client2');

// client3 connect to client 2
client3.connect('client2');

// callback if client2 get event from client1
client2.setEventRespond('client1', (e) => {
	console.log('msg type: ', e.type);
	console.log('got msg:', e.detail);
});

// callback if client1 get event from client2
client1.setEventRespond('client2', (e) => {
	console.log('msg type: ', e.type);
	console.log('got msg:', e.detail);
});

// send event from client1 to client2
client1.send('client2', { msg: 'test1' });

// send event from client2 to client1
client2.send('client1', { msg: 'test2' });

// send event from client3 to client2
client3.send('client2', { msg: 'test3' });
