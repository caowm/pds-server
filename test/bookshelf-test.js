const knex = require('knex')({
  client: 'postgres',
  connection: {
    host: '127.0.0.1',
    database: 'strapi',
    user: 'postgres',
    password: 'postgres'
  }
});

const bookshelf = require('bookshelf')(knex);

const User = bookshelf.model('User', {
  tableName: 'users-permissions_user'
});

new User({id: 5}).fetch().then((data) => console.log(data.toJSON()))
  .catch((error) => console.log(error));


