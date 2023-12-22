# Secret-events-communication
Encrypted events E2E - Send event to specific listener while no one else can predict the event name.

Two "clients" (clients is an instance of SEC class) need to connect each other (swap keys) befor they can send events to each other.

The current method for keys swap is diffie hellman.

Example can be found in `test.js` file.
