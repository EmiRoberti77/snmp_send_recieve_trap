## SNMP Trap Receiver and Sender Project

This project consists of two parts: an SNMP trap sender and an SNMP trap receiver. The sender sends SNMP traps to simulate network events such as LinkDown, LinkUp, and system reboots (ColdStart, WarmStart). The receiver listens for these traps and logs them in a readable format.

# What is SNMP?

Simple Network Management Protocol (SNMP) is a protocol used for managing devices on a network, including routers, switches, servers, and more. Devices can send traps to notify a central management system (like a network management console) about critical events like interfaces going down, system restarts, or warnings.

# What is an OID?

OID stands for Object Identifier. It is a globally unique identifier used in SNMP to specify different types of information. OIDs are hierarchically structured and typically consist of a series of numbers separated by periods (e.g., 1.3.6.1.2.1.1.5.0). Each OID identifies a piece of data in an SNMP-compliant device, such as:

# System Uptime

Device Name (sysName)
Interface Status
In the case of SNMP traps, specific OIDs are used to identify trap types such as LinkUp or ColdStart.

## Project Structure

- sendTrap.js: Sends SNMP traps to simulate network events.
- receiveTrap.js: Listens for SNMP traps and processes them into a readable format.

# Setting Up

Prerequisites
You need to have Node.js installed on your machine. You also need the net-snmp package for interacting with SNMP.

Install dependencies: In the project directory, run:

```bash
npm install net-snmp getopts
```

Ensure the following ports are open:

- Port 162: This is the standard port for SNMP traps and is used by the receiver.

## Running the Project

- 1. Running the Trap Receiver
     The trap receiver listens for SNMP traps and logs them in a readable format. It identifies the trap type using OID lookup.

Run the trap receiver:

```bash
node receiveTrap.js
```

# Available Options:

- -v: Verbose mode (detailed logging with full trap data).
- -p: Specify the port to listen on (default: 162).

Once running, the receiver will log traps it receives.

# example output

```bash
03/10/2024, 08:59:26: LinkUp: 127.0.0.1 : 1.3.6.1.6.3.1.1.5.4 -> someValue
```

## Running the Trap Sender

You can simulate network events by sending SNMP traps. The sendTrap.js file allows you to send different types of traps, such as LinkUp, LinkDown, WarmStart, and ColdStart.

Run the trap sender:

```bash
node sendTrap.js
```

You can modify the trap type in the sendTrap.js file to test different events.

# Code Explanation

receiveTrap.js (Trap Receiver)
This file listens for SNMP traps using the net-snmp library. The following key components are in the code:

- SNMP Receiver: A createReceiver() function sets up the SNMP trap listener.
- Callback Function: When a trap is received, the callback function (cb) processes the message. It checks the trap type and extracts the necessary information.
- Trap Type Lookup: For common trap types (like ColdStart, WarmStart, LinkDown, LinkUp), we use a lookup table to convert OIDs into readable trap names.

# Trap Type Lookup Table

```javascript
const trapTypeLookup = {
  '1.3.6.1.6.3.1.1.5.1': 'ColdStart',
  '1.3.6.1.6.3.1.1.5.2': 'WarmStart',
  '1.3.6.1.6.3.1.1.5.3': 'LinkDown',
  '1.3.6.1.6.3.1.1.5.4': 'LinkUp',
  '1.3.6.1.6.3.1.1.5.5': 'AuthenticationFailure',
  '1.3.6.1.6.3.1.1.5.6': 'EGPNeighborLoss',
};
```

# Trap Parsing:

- SNMPv1: For SNMPv1 traps, the trap type is identified by a generic-trap field (e.g., ColdStart, WarmStart, etc.).
- SNMPv2c and SNMPv3: For SNMPv2c/v3, the first varbind (variable binding) usually contains the trap OID, which we map to the trap type using the lookup table.

# Example ( sending a LinkUp trap)

```javascript
const session = snmp.createSession('127.0.0.1', 'public');

session.trap(snmp.TrapType.LinkUp, (error) => {
  if (error) {
    console.error('Error sending trap: ', error);
  } else {
    console.log('LinkUp trap sent successfully!');
  }
});
```

# OID Reference

Sample of common SNMP trap OIDs and their meanings:

- 1.3.6.1.6.3.1.1.5.1: ColdStart (system restart with full power cycle)
- 1.3.6.1.6.3.1.1.5.2: WarmStart (system restart without full power cycle)
- 1.3.6.1.6.3.1.1.5.3: LinkDown (network link is down)
- 1.3.6.1.6.3.1.1.5.4: LinkUp (network link is up)
- 1.3.6.1.6.3.1.1.5.5: Authentication Failure (failed SNMP authentication)
- 1.3.6.1.6.3.1.1.5.6: EGP Neighbor Loss (external gateway protocol neighbor down)

  Links used to build this code
  
  - http://www.net-snmp.org/docs/readmefiles.html
  - https://www.npmjs.com/package/net-snmp
  
