from os import environ

from aiohttp import web

from modules.base import ModuleConfig
from modules.main import MainModule
from modules.receiver import ReceiverModule

host, port = environ['DB_URL'].split(':')
db_name = environ.get('DB_NAME', 'postgres')
db_user = environ.get('DB_USER', 'postgres')
files_url = environ.get('FILES_URL')
setup_file = environ.get('SETUP_FILE')

config = ModuleConfig(
    db_host=host,
    db_port=port,
    db_username=db_user,
    db_name=db_name,
    files_url=files_url,
    setup_file_path=setup_file
)
main_module = MainModule(config)
receiver_module = ReceiverModule(config)

app = web.Application()
app.add_routes([
    web.post('/back/start_test', receiver_module.start_test),
    web.post('/back/end_test', receiver_module.end_test),
    web.post('/back/start_step', receiver_module.start_step),
    web.post('/back/end_step', receiver_module.end_step),

    web.post('/back/add_metric', receiver_module.add_metric),
    web.post('/back/add_attachment', receiver_module.add_attachment),
    web.post('/back/add_test_results', main_module.add_test_results),
    web.post('/back/add_test_known_issue', main_module.add_test_known_issue),
    web.post('/back/remove_test_known_issue', main_module.remove_test_known_issue),

    web.post('/back/get_test_results', main_module.get_test_results),
    web.post('/back/get_tests', main_module.get_tests),
    web.post('/back/get_test_info', main_module.get_test_info),
    web.post('/back/get_tests_info', main_module.get_tests_info),
    web.post('/back/get_steps', main_module.get_steps),
    web.post('/back/get_metrics', main_module.get_metrics),
    web.post('/back/get_metric', main_module.get_metric),
    web.post('/back/get_attachments', main_module.get_attachments),
    web.post('/back/get_test_history', main_module.get_test_history),

    web.post('/back/get_reports', main_module.get_reports),
    web.post('/back/get_report_tests', main_module.get_report_tests),
    web.post('/back/get_report_pages', main_module.get_report_pages),
    web.post('/back/get_report_statistics', main_module.get_report_statistics),
    web.post('/back/add_test_properties', main_module.add_test_properties),
    web.post('/back/remove_test_properties', main_module.remove_test_properties),
    web.post('/back/update_report', main_module.update_report),
    web.post('/back/add_report', main_module.add_report),
    web.post('/back/add_exclude_tests', main_module.add_exclude_tests),
    web.post('/back/get_excluded_tests', main_module.get_excluded_tests),
    web.post('/back/delete_test', main_module.delete_test),
    web.post('/back/delete_report', main_module.delete_report),
    web.post('/back/delete_attachments', main_module.delete_attachments),
    web.post('/back/edit_tests_info', main_module.edit_tests_info),
]),

web.run_app(app, port=int(environ.get('PORT', 9999)))
