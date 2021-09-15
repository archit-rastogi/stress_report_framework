from os import environ

from aiohttp import web

from backend.server.modules.main import MainModule

host, port = environ['DB_URL'].split(':')
db_name = environ.get('DB_NAME', 'postgres')
db_user = environ.get('DB_USER', 'postgres')

main_module = MainModule(host, int(port), db_name, db_user)

app = web.Application()
app.add_routes([
    web.post('/back/start_run', main_module.start_run),
    web.post('/back/end_run', main_module.end_run),
    web.post('/back/start_step', main_module.start_step),
    web.post('/back/end_step', main_module.end_step),
    web.post('/back/add_metric', main_module.add_metric),
    web.post('/back/get_runs', main_module.get_runs),
    web.get('/back/get_steps', main_module.get_steps),
    web.get('/back/get_metrics', main_module.get_metrics),
]),

web.run_app(app, port=int(environ.get('PORT', 9999)))
