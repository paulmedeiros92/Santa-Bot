const { initializeApp } = require('firebase/app');
const {
  getFirestore, doc, setDoc, query, where, collection, getDocs,
} = require('firebase/firestore/lite');
const { firebase } = require('./config.json');

const app = initializeApp(firebase);
const db = getFirestore(app);

function addMembers(guild) {
  guild.members.cache
    // .filter((member) => !member.user.bot)
    .each((member) => {
      const memberRef = doc(db, 'guilds', guild.id, 'members', member.id);
      setDoc(memberRef, { username: member.displayName, id: member.id }, { merge: true })
        .catch(() => console.log('failed to set user'));
    });
}

exports.buildUserBase = (client) => new Promise((resolve, reject) => {
  client.guilds.cache.each((guild) => {
    setDoc(doc(db, 'guilds', guild.id), { guildId: guild.id, guildName: guild.name })
      .then(() => {
        addMembers(guild);
        resolve();
      })
      .catch(() => reject());
  });
});

exports.getMembers = (guildId, memberIds) => {
  const membersRef = collection(db, 'guilds', guildId, 'members');
  const q = query(membersRef, where('id', 'in', memberIds));
  return getDocs(q);
};
