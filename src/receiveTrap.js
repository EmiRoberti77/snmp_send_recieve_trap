const snmp = require('net-snmp');

// Create a trap listener
const trapListener = snmp.createSocket({ family: 'udp4', type: 'trap' });

// Handle incoming SNMP trap messages
trapListener.on('message', (msg, rinfo) => {
  console.log(`SNMP trap received from ${rinfo.address}:${rinfo.port}`);

  try {
    // Parse the SNMP message
    let parsedMsg = snmp.createMessage(msg);

    // Iterate over varbinds (variable bindings)
    parsedMsg.pdu.varbinds.forEach((varbind) => {
      if (snmp.isVarbindError(varbind)) {
        console.error('Varbind error:', snmp.varbindError(varbind));
      } else {
        console.log(`OID: ${varbind.oid}, Value: ${varbind.value}`);
      }
    });
  } catch (error) {
    console.error('Error parsing SNMP trap:', error);
  }
});

// Bind to port 162 to listen for traps
trapListener.bind({ port: 162 }, (error) => {
  if (error) {
    console.error('Error binding to port:', error);
  } else {
    console.log('Listening for SNMP traps on port 162');
  }
});

// Gracefully handle process interruption (Ctrl + C)
process.on('SIGINT', () => {
  trapListener.close(() => {
    console.log('SNMP trap listener closed');
  });
});
