const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const log4js = require('./logger');

const logger = log4js.buildLogger();
let db = {};

function allQuery(query, params) {
  logger.info(`allQuery start: ${params}`);
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        logger.error(`allQuery: ${err.message}`);
        reject(err);
      }
      logger.info(`allQuery success: ${params}`);
      rows.forEach((row) => {
        logger.info(`allQuery: ${row.name}`);
      });
      resolve();
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

function createUsersTable() {
  logger.info('createUsersTable: start');
  const query = 'CREATE TABLE IF NOT EXISTS users (id TEXT NOT NULL, username TEXT NOT NULL, karma INTEGER NOT NULL, UNIQUE(id))';
  return new Promise((resolve, reject) => {
    db.exec(query, (err) => {
      if (err) {
        logger.error(`createUsersTable: ${err.message}`);
        reject(err);
      } else {
        logger.info('createUsersTable: success');
        resolve(true);
      }
    });
  });
}

function createPresentsTable() {
  logger.info('createPresentsTable: start');
  const query = 'CREATE TABLE IF NOT EXISTS presents (userId INTEGER NOT NULL, desc TEXT NOT NULL, ranking INTEGER NOT NULL, year INTEGER NOT NULL CHECK(ranking <= 5 AND ranking > 0), UNIQUE(userId, ranking))';
  return new Promise((resolve, reject) => {
    db.exec(query, (err) => {
      if (err) {
        logger.error(`createPresentsTable: ${err.message}`);
        reject(err);
      } else {
        logger.info('createPresentsTable: success');
        resolve(true);
      }
    });
  });
}

exports.setPresents = (userId, presents) => {
  const valuesTxt = presents.map(() => '(?,?,?,?)').join(', ');
  let values = [];
  presents.forEach((present) => {
    values = values.concat([userId, present[0], present[1], moment().year()]);
  });
  logger.info('setPresent: start');
  const updateQuery = `INSERT OR REPLACE INTO presents (userId, desc, ranking, year) VALUES ${valuesTxt}`;
  return new Promise((resolve, reject) => {
    db.run(updateQuery, values, (err) => {
      if (err) {
        logger.error(`setPresents: ${err.message}`);
        reject(err);
      } else {
        logger.info('setPresents: success');
        resolve();
      }
    });
  });
};

exports.getPresents = (id) => {
  logger.info('getPresents: start');
  const getQuery = 'SELECT desc FROM presents WHERE userId = ? AND year = ? ORDER BY ranking ASC';
  return new Promise((resolve, reject) => {
    db.all(getQuery, [id, moment().year()], (err, rows) => {
      if (err) {
        logger.error(`getPresents: ${err.message}`);
        reject(err);
      } else {
        logger.info('getPresents: success');
        resolve(rows);
      }
    });
  });
};

function setUser(id, username, karma) {
  const query = 'INSERT OR IGNORE INTO users (id, username, karma) VALUES (?,?,?)';
  const promise = allQuery(query, [id, username, karma]);
  return promise;
}

exports.getUsersById = (ids) => {
  logger.info('getUsersById: start');
  const qs = ids.map(() => '?');
  const getQuery = `SELECT id, username, karma FROM users WHERE id in (${qs.join(',')}) ORDER BY karma DESC`;
  return new Promise((resolve, reject) => {
    db.all(getQuery, ids, (err, rows) => {
      if (err) {
        logger.error(`getUsersById: ${err.message}`);
        reject(err);
      } else {
        logger.info('getUsersById: success');
        resolve(rows);
      }
    });
  });
};

exports.getAllUsers = () => {
  logger.info('getAllUsers: start');
  const getQuery = 'SELECT id, username, karma FROM users ORDER BY karma DESC';
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
  return new Promise((resolve, reject) => {
    Array.from(guilds.values()).forEach((guild) => {
      createUsersTable()
        .then(() => {
          const userPromises = [];
          guild.members.cache.array().forEach((member) => {
            if (!member.user.bot) {
              userPromises.push(setUser(member.id, member.displayName, 0));
            }
          });
          Promise.all(userPromises)
            .then(() => resolve())
            .catch((error) => {
              logger.error(`Could not set a user row: ${error}`);
              reject();
            });
        })
        .catch((error) => {
          logger.error(`Could not create users table: ${error}`);
          reject();
        });
      createPresentsTable();
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
