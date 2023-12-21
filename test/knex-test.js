

// 测试通过

///////////////////////////////////////////////////////////////////
// await is only valid in async function！！！！！！
///////////////////////////////////////////////////////////////////

/*
node With v14.8.0, top level await has been unflagged and now just works.
The only catch is that top level await is only supported in ES modules.
This means either adding "type": "module" to your package.json file
or renaming your .js file to .mjs.

knex is thenable object, so you can await.
*/

// knex连oracle：https://blogs.oracle.com/opal/post/nodejs-knex-and-oracle-autonomous-database

// mssql 连接测试通过
var knex = require('knex')({
  client: 'mssql',
  connection: {
    host : '127.0.0.1',
    user : 'sa',
    password : '123456',
    database : 'his_sys',
    options: {
      encrypt: false
    }
  }
});

knex('sys_office')
  // .where('id', '>', 1)
  // .where({id: 3})
  .select()
  .then( (row) => console.log(row))
  .catch((err) => console.log(err))

return

var knex = require('knex')({
  client: 'postgresql',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'postgres',
    database : 'strapi-commerce'
  }
});

let statement, result;

(async () => {
  // call stored procedure
  // 返回table
  result = await knex.raw('select * from test(?)', [3]);
  console.log(result);

  // 返回参数
  result = await knex.raw('select test2(?)', [3]);
  console.log(result);

  return;

  let builder = knex('users-permissions_user')
    .where('id', '>', 1)
    .where({id: 3})
    .select()
  console.log(builder.toQuery());

  // let result = await builder;
  // console.log(result);

  builder = knex('users-permissions_user').select('id', 'org')
    .where((builder) =>
      builder.where('id', '>', 10).orWhere('id', '<', 5)
    )
    .andWhere(function() {
      this.where('id', '>', 10)
    });
  console.log(await builder);

  console.log(knex("programs").count("active").min("age").avg("age").toQuery());

  console.log(knex("users").insert([
    { full_name: "Test User1", email: "test1@google.com" },
    { full_name: "Test User2", email: "test2@google.com", address: "shanghai" },
    { full_name: "Test User3", email: "test3@google.com" },
  ]).toQuery());

})();

//
// knex.transaction(async trx => {
//   let result = await trx.raw('update comments set content=? where id < ? ', ['精彩万分', 5]);
//   console.log(result);
//
//   result = await trx.raw('update posts set comment_count=comment_count+1 where id < ? ', [5]);
//   console.log(result);
//
//   let comments =  await trx.select('*').from('comments').where('id', '<', 5);
//   console.log(comments);
// })



/*
knex('users-permissions_user')
  .where('id', '>', 1)
  .where({id: 3})
  .select()
  .then( (row) => console.log(row))
  .catch((err) => console.log(err))

knex("users").where("age", ">", 18).first();
// filter users by multiple where columns
knex("users")
  .where({
    full_name: "Test User",
    is_boat: true,
  })
  .select("id");
// select subquery
const usersSubquery = knex("users")
  .where("age", ">", 18)
  .andWhere("is_deleted", false)
  .select("id");
knex("programs").where("id", "in", usersSubquery);
// pagination with offset and limit
knex.select("*").from("orders").offset(0).limit(50);


// insert
knex("users").insert({ full_name: "Test User", email: "test@google.com" });
// multi row insert
knex("users").insert([
  { full_name: "Test User1", email: "test1@google.com" },
  { full_name: "Test User2", email: "test2@google.com" },
  { full_name: "Test User3", email: "test3@google.com" },
]);
// update
knex("orders").where("id", 7823).update({
  status: "archived",
});
// delete
knex("orders").where("is_deleted", true).del();
// count rows
knex("programs").count("active");
// like this you can user .min, .max, .sum etc



 */
