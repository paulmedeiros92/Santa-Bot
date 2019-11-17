const log4js = require('log4js');
const sqlite3 = require('sqlite3').verbose();

log4js.configure({
  appenders: {
    console: { type: 'console' },
    activity: { type: 'file', filename: 'activity.log', category: 'activity' },
  },
  categories: {
    default: { appenders: ['console', 'activity'], level: 'trace' },
  },
});
const logger = log4js.getLogger('activity');
let db = {};

function allQuery(query, params) {
  logger.info('allQuery: start');
  db.all(query, params, (err, rows) => {
    if (err) {
      logger.error(`allQuery: ${err.message}`);
      throw err;
    }
    logger.info('allQuery: successs');
    rows.forEach((row) => {
      logger.info(`allQuery: ${row.name}`);
    });
  });
}

exports.openDB = (path) => {
  logger.info('openDB: attempting to open DB');
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        logger.error(`openDB: ${err.message}`);
        reject(err.message);
      } else {
        logger.info('openDb: connected to the in-memory SQlite database.');
        resolve(true);
      }
    });
  });
};

function createTable() {
  logger.info('createTable: start');
  const query = 'CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL, username TEXT NOT NULL, karma INTEGER NOT NULL, UNIQUE(id))';
  return new Promise((resolve, reject) => {
    db.exec(query, (err) => {
      if (err) {
        logger.error(`createTable: ${err.message}`);
        reject(err);
      } else {
        logger.info('createTable: success');
        resolve(true);
      }
    });
  });
}

function setUser(id, username, karma) {
  const query = 'INSERT OR IGNORE INTO users (id, username, karma) VALUES (?,?,?)';
  allQuery(query, [parseInt(id, 10), username, karma]);
}

exports.getUsers = (ids) => {
  logger.info('getUsers: start');
  const qs = ids.map(() => '?');
  const getQuery = `SELECT id, username, karma FROM users WHERE id in (${qs.join(',')})`;
  return new Promise((resolve, reject) => {
    db.all(getQuery, ids, (err, rows) => {
      if (err) {
        logger.error(`getUsers: ${err.message}`);
        reject(err);
      } else {
        logger.info('getUsers: success');
        resolve(rows);
      }
    });
  });
};

exports.getAllUsers = () => {
  logger.info('getAllUsers: start');
  const getQuery = 'SELECT id, username, karma FROM users';
  return new Promise((resolve, reject) => {
    db.all(getQuery, [], (err, rows) => {
      if (err) {
        logger.error(`getAllUsers: ${err.message}`);
        reject(err);
      } else {
        logger.info('getAllUsers: success');
        resolve(rows);
      }
    });
  });
};

exports.updateKarma = (id, karma) => {
  logger.info(`updateKarma: start ${karma}`);
  const updateQuery = 'UPDATE users SET karma = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(updateQuery, [karma, id], (err) => {
      if (err) {
        logger.error(`updateKarma: ${err.message}`);
        reject(err);
      } else {
        logger.info('updateKarma: success');
        resolve();
      }
    });
  });
};

exports.buildGuildTables = (guilds) => {
  Array.from(guilds.values()).forEach((guild) => {
    createTable().then(() => {
      Array.from(guild.members.values()).forEach((member) => {
        if (!member.user.bot) {
          setUser(member.id, member.displayName, 0);
        }
      });
    });
  });
};

exports.closeDB = () => {
  logger.info('closeDB: start');
  // close the database connection
  db.close((err) => {
    if (err) {
      logger.error(`closeDB: ${err.message}`);
    }
    logger.info('closeDB: success');
  });
};
