const server = require('koa-static');
const koa = require('koa');
const app = new koa();

app.use(server(__dirname + '/application'));

app.listen(3001);

console.log('listening on port 3001');