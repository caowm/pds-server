const qs = require('qs');

var query = qs.stringify({
  _where: {
    _or: [
      [{ stars: 2 }, { pricing_lt: 80 }], // implicit AND
      [{ stars: 1 }, { pricing_gte: 50 }], // implicit AND
    ],
  },
});

console.log(query);

query = qs.stringify({
  _where: {
    _or: [
      {org_eq: 2 },
      {share_eq: true },
      {source_eq: "expert"}]
  },
});

console.log(query);
