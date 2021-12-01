const { initializeApp } = require('firebase/app');
const {
  getFirestore, doc, setDoc, query, where, collection, getDocs, writeBatch,
} = require('firebase/firestore/lite');
const { firebase } = require('../config.json');

const app = initializeApp(firebase);
const db = getFirestore(app);

async function addMembers(guild) {
  const batch = writeBatch(db);
  const members = await guild.members.fetch();
  members.filter((member) => !member.user.bot).each((member) => {
    const memberRef = doc(db, 'guilds', guild.id, 'members', member.user.id);
    batch.set(memberRef, { username: member.user.username, id: member.user.id }, { merge: true });
  });
  batch.commit();
}

exports.addPresent = (guildId, present) => {
  const memberRef = doc(db, 'guilds', guildId, 'presents', present.userId + present.rank);
  return setDoc(memberRef, present, { merge: true });
};

exports.getUserPresents = async (guildId, userId = undefined) => {
  const membersRef = collection(db, 'guilds', guildId, 'presents');
  const q = userId ? query(membersRef, where('userId', '==', userId)) : membersRef;
  return (await getDocs(q)).docs.map((document) => document.data());
};

exports.addMember = (guildId, user) => {
  const memberRef = doc(db, 'guilds', guildId, 'members', user.id);
  return setDoc(memberRef, { username: user.username, id: user.id }, { merge: true });
};

exports.buildUserBase = async (guild) => {
  await setDoc(doc(db, 'guilds', guild.id), { guildId: guild.id, guildName: guild.name });
  return addMembers(guild);
};

exports.getMembers = async (guildId, memberIds = []) => {
  const membersRef = collection(db, 'guilds', guildId, 'members');
  const q = memberIds.length > 0 ? query(membersRef, where('id', 'in', memberIds)) : membersRef;
  return (await getDocs(q)).docs.map((document) => {
    const member = document.data();
    if (member.karma === undefined) {
      member.karma = 0;
    }
    return member;
  });
};

exports.updateMembers = async (guildId, members) => {
  const batch = writeBatch(db);
  members.forEach((member) => {
    const memberRef = doc(db, 'guilds', guildId, 'members', member.id);
    batch.update(memberRef, { karma: member.karma });
  });
  return batch.commit();
};
