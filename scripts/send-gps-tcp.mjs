#!/usr/bin/env node
/**
 * Send a newline-delimited JSON GPS packet to the TCP GPS server.
 *
 * Usage:
 *   node scripts/send-gps-tcp.mjs --host 127.0.0.1 --port 5023 --imei 869343040629929 --lat 23.81 --lng 90.41
 */

import { connect } from 'net';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (key && value !== undefined) args[key] = value;
  }
  return args;
}

const args = parseArgs(process.argv);
const host = args.host ?? '127.0.0.1';
const port = Number(args.port ?? '5023');
const imei = args.imei ?? '869343040629929';
const lat = Number(args.lat ?? '23.8103');
const lng = Number(args.lng ?? '90.4125');
const speed = args.speed !== undefined ? Number(args.speed) : 25;
const heading = args.heading !== undefined ? Number(args.heading) : 180;

if (!Number.isFinite(port) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
  console.error('Invalid --port, --lat, or --lng');
  process.exit(1);
}

const payload = JSON.stringify({ imei, lat, lng, speed, heading }) + '\n';

const socket = connect({ host, port }, () => {
  socket.write(payload);
});

let response = '';
socket.on('data', (chunk) => {
  response += chunk.toString('utf8');
  if (response.includes('\n')) {
    console.log('Server:', response.trim());
    socket.end();
  }
});

socket.on('error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});

socket.on('close', () => {
  if (!response.trim()) {
    console.error('No response from server');
    process.exit(1);
  }
});
