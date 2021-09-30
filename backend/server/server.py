from os import environ

from aiohttp import web

from modules.main import MainModule
from modules.receiver import ReceiverModule

host, port = environ['DB_URL'].split(':')
db_name = environ.get('DB_NAME', 'postgres')
db_user = environ.get('DB_USER', 'postgres')

params = host, int(port), db_name, db_user
main_module = MainModule(*params)
receiver_module = ReceiverModule(*params)

app = web.Application()
app.add_routes([
    web.post('/back/start_test', receiver_module.start_test),
    web.post('/back/end_test', receiver_module.end_test),
    web.post('/back/start_step', receiver_module.start_step),
    web.post('/back/end_step', receiver_module.end_step),

    web.post('/back/add_metric', receiver_module.add_metric),
    web.post('/back/add_attachment', receiver_module.add_attachment),

    web.post('/back/get_tests', main_module.get_tests),
    web.get('/back/get_steps', main_module.get_steps),
    web.get('/back/get_metrics', main_module.get_metrics),
    web.get('/back/get_attachments', main_module.get_attachments),

    web.get('/back/get_reports', main_module.get_reports),
    web.post('/back/add_report_case', main_module.add_report_case),
    web.post('/back/get_report_tests', main_module.get_report_tests),
    web.post('/back/add_report', main_module.add_report)
]),

web.run_app(app, port=int(environ.get('PORT', 9999)))
