const sqlite3 = require('sqlite3').verbose();

let db = {};

function allQuery(query, params) {
  db.all(query, params, (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row.name);
    });
  });
}

exports.openDB = function (path) {
  // open database in memory
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        reject(err.message);
      } else {
        console.log('Connected to the in-memory SQlite database.');
        resolve(true);
      }
    });
  });
};

function createTable() {
  const query = 'CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL, username TEXT NOT NULL, karma INTEGER NOT NULL, UNIQUE(id))';
  return new Promise((resolve, reject) => {
    db.exec(query, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function setUser(id, username, karma) {
  const query = 'INSERT OR IGNORE INTO users (id, username, karma) VALUES (?,?,?)';
  allQuery(query, [parseInt(id, 10), username, karma]);
}

exports.getUsers = (ids) => {
  const qs = ids.map(() => '?');
  const getQuery = `SELECT id, username, karma FROM users WHERE id in (${qs.join(',')})`;
  return new Promise((resolve, reject) => {
    db.all(getQuery, ids, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.updateKarma = (id, karma) => {
  const updateQuery = 'UPDATE users SET karma = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(updateQuery, [karma, id], (err) => {
      if (err) {
        reject(err);
      } else {
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
  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    return console.log('Close the database connection.');
  });
};
