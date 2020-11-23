exports.BOTID = '643605290842849310';
exports.BOTID2 = '645442655559614479';
exports.dbPath = '../SantaDB/SantaDB.db';
exports.channels = [
  {
    name: 'naughty',
    options: {
      type: 'text',
    },
  },
  {
    name: 'nice',
    options: {
      type: 'text',
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
