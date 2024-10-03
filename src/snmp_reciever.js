const snmp = require('net-snmp');
const getopts = require('getopts');

const options = getopts(process.argv.slice(2));
const verbose = options.v;
const snmpOptions = {
  disableAuthorization: options.n,
  port: options.p || 162,
  transport: options.t,
  engineID: options.e,
  includeAuthentication: options.a,
};

const trapTypeLookup = {
  '1.3.6.1.6.3.1.1.5.1': 'ColdStart',
  '1.3.6.1.6.3.1.1.5.2': 'WarmStart',
  '1.3.6.1.6.3.1.1.5.3': 'LinkDown',
  '1.3.6.1.6.3.1.1.5.4': 'LinkUp',
  '1.3.6.1.6.3.1.1.5.5': 'AuthenticationFailure',
  '1.3.6.1.6.3.1.1.5.6': 'EGPNeighborLoss',
};

const cb = function (error, trap) {
  const now = new Date().toLocaleString();

  if (error) {
    console.log(now + ': ' + error.message);
    console.error(error);
    return;
  }

  const trapType = snmp.PduType[trap.pdu.type] || 'Unknown';

  if (verbose) {
    console.log(now + ': ' + trapType + ' received:');
    console.log(JSON.stringify(trap, null, 2));
  } else {
    if (trap.pdu.type === snmp.PduType.Trap) {
      // SNMPv1 Trap: Use the generic trap number
      const genericTrap = trap.pdu.generic;
      let trapName;
      switch (genericTrap) {
        case 0:
          trapName = 'ColdStart';
          break;
        case 1:
          trapName = 'WarmStart';
          break;
        case 2:
          trapName = 'LinkDown';
          break;
        case 3:
          trapName = 'LinkUp';
          break;
        case 4:
          trapName = 'AuthenticationFailure';
          break;
        case 5:
          trapName = 'EGPNeighborLoss';
          break;
        default:
          trapName = 'EnterpriseSpecific';
      }
      console.log(
        `${now}: ${trapName}: ${trap.rinfo.address} : ${trap.pdu.enterprise}`
      );
    } else {
      // SNMPv2c or SNMPv3 Trap: Check the first varbind's OID for the trap type
      const trapOid = trap.pdu.varbinds[0]?.oid;
      const trapName = trapTypeLookup[trapOid] || 'Unknown Trap Type';

      trap.pdu.varbinds.forEach((varbind) => {
        console.log(
          `${now}: ${trapName}: ${trap.rinfo.address} : ${varbind.oid} -> ${varbind.value}`
        );
      });
    }
  }
};

const receiver = snmp.createReceiver(snmpOptions, cb);
// Add authorization for the "public" community string (used in SNMPv2c)
const authorizer = receiver.getAuthorizer();
authorizer.addCommunity('public');
