exports.BOTID = '643605290842849310';
exports.BOTID2 = '645442655559614479';
exports.dbPath = '../SantaDB/SantaDB.db';
exports.channels = [
  {
    name: 'Holidays',
    options: {
      type: 'category',
    },
  },
  {
    name: 'Naughty',
    options: {
      type: 'text',
      topic: 'Let\'s get naughty!',
      permissionOverwrites: [
        {
          id: 'INSERT_ID',
          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: 'INSERT_ID',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: 'INSERT_ID',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
      ],
    },
  },
  {
    name: 'Nice',
    options: {
      type: 'text',
      topic: 'Let\'s be nice',
      permissionOverwrites: [
        {
          id: 'INSERT_ID',
          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: 'INSERT_ID',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: 'INSERT_ID',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
      ],
    },
  },
];
exports.roles = [
  {
    data: {
      name: 'Naughty',
      color: 'RED',
    },
    reason: 'Build "Naughty" role on startup',
  },
  {
    data: {
      name: 'Nice',
      color: 'GREEN',
    },
    reason: 'Build "Nice" role on startup',
  },
];
