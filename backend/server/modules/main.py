from datetime import datetime, timedelta

from modules.base import AbstractModule, request_handler


class MainModule(AbstractModule):

    @request_handler()
    async def get_tests(self, params: dict):
        start_date = datetime.fromtimestamp(params['date'])
        start_date = start_date - timedelta(
            hours=-1 * start_date.hour,
            seconds=-1 * start_date.second,
            minutes=-1 * start_date.minute
        )
        end_date = start_date + timedelta(days=1)
        return {'tests': await self.db.get_tests(start_date, end_date)}

    @request_handler(get_params=True, post_params=False)
    async def get_steps(self, params: dict):
        test_id = params['test_id']
        return {'steps': await self.db.get_steps(test_id)}

    @request_handler(get_params=True, post_params=False)
    async def get_metrics(self, params: dict):
        test_id = params['test_id']
        return {'metrics': await self.db.get_metrics(test_id)}

    @request_handler(get_params=True, post_params=False)
    async def get_attachments(self, params: dict):
        test_id = params['test_id']
        return {'attachments': await self.db.get_attachments(test_id)}

    @request_handler()
    async def add_report(self, params: dict):
        name: str = params['name']
        return {'report_id': await self.db.add_report(name)}

    @request_handler(get_params=False, post_params=False)
    async def get_reports(self):
        return {'reports': await self.db.get_reports()}

    @request_handler()
    async def add_report_case(self, params: dict):
        case_id = params['case_id']
        report_id = params['report_id']

        await self.db.add_report_case(report_id, case_id)

    @request_handler()
    async def get_report_tests(self, params: dict):
        name = params['name']
        return {'tests': await self.db.get_report_cases(name)}
