const client1 = new SEC('client1');
SEC.prototype.connect = (n) => console.log(n); // check Object.freeze(SEC)
const client2 = new SEC('client2');
const client3 = new SEC('client3');

client1.connect('client2');
client3.connect('client2');

client2.setEventRespond('client1', (e) => {
	console.log('msg type: ', e.type);
	console.log('got msg:', e.detail);
});

client1.setEventRespond('client2', (e) => {
	console.log('msg type: ', e.type);
	console.log('got msg:', e.detail);
});

client1.send('client2', { msg: 'hey' });
client2.send('client1', { msg: 'wazzaaaaaup my dude2' });
client3.send('client2', { msg: 'wazzaaaaaup my dude1' });
client2.setEventRespond('client3', (e) => {
	console.log('msg type: ', e.type);
	console.log('1+3=5 nahh its not');
	console.log(e.detail.msg);
	a = e.detail.msg;
});
client2.send('client3', { msg: 'wazzaaaaaup my dude3' });
