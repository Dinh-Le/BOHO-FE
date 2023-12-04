const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

router.render = (req, res) => {
    res.jsonp({
        message: 'success',
        success: true,
        data: res.locals.data
    })
}

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(jsonServer.rewriter({
    '/api/rest/v1/user/:user_id/group': '/group',
    '/api/rest/v1/user/:user_id/group/:group_id': '/group/:group_id',
    '/api/rest/v1/user/:user_id/group_management': '/group_management',
    '/api/rest/v1/user/:user_id/group_management/:group_management_id': '/group_management/:group_management_id',
    '/api/rest/v1/user/:user_id/node': '/node',
    '/api/rest/v1/user/:user_id/node?npi=([^/]+)': '/node?node_operator_id=$1',
    '/api/rest/v1/user/:user_id/node/:node_id': '/node/:node_id',
    '/api/rest/v1/user/:user_id/node/:node_id/device': '/device?node_id=:node_id',
    '/api/rest/v1/user/:user_id/node/:node_id/device/:device_id': '/device/:device_id',
    '/api/rest/v1/user/:user_id/node_operator': '/node_operator',
    '/api/rest/v1/user/:user_id/node_operator/:node_operator_id': '/node_operator/:node_operator_id',

  }));
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running')
})