rs.initiate({
  _id: "mongodb_replica_set",
  members: [
    { _id: 0, host: "mongodb-master:27017" },
    { _id: 1, host: "mongodb-slave1:27017" },
    { _id: 2, host: "mongodb-slave2:27017" },
  ],
});

// db.createUser({
//   user: "backbone",
//   pwd: "password",
//   roles: [{ role: "dbOwner", db: "backbone-db" }],
//   passwordDigestor: "server",
// });
