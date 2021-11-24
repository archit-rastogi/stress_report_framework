import asyncio
from datetime import datetime

from requests import get

from modules.base import AbstractModule, request_handler


class MainModule(AbstractModule):

    @request_handler()
    async def get_tests(self, params: dict):
        start = datetime.fromtimestamp(params['start'])
        end = datetime.fromtimestamp(params['end'])
        filters = params.get('filters')
        return {'tests': await self.db.get_tests(start, end, filters=filters)}

    @request_handler()
    async def get_steps(self, params: dict):
        test_id = params['test_id']
        return {'steps': await self.db.get_steps(test_id)}

    @request_handler()
    async def get_metrics(self, params: dict):
        test_id = params['test_id']
        return {'metrics': await self.db.get_metrics(test_id)}

    @request_handler()
    async def get_attachments(self, params: dict):
        test_id = params['test_id']
        return {'attachments': await self.db.get_attachments(test_id)}

    @request_handler()
    async def add_report(self, params: dict):
        name: str = params['name']
        config: dict = params['config']
        return {'report_id': await self.db.add_report(name, config)}

    @request_handler(post_params=False)
    async def get_reports(self):
        return {'reports': await self.db.get_reports()}

    @request_handler()
    async def get_report_tests(self, params: dict):
        name = params['name']
        report = await self.db.find_report_by_name(name)
        return {'tests': await self.db.get_report_cases(report['report_id'])}

    @request_handler()
    async def update_report(self, params: dict):
        new_config = params['config']
        report_id = params['report_id']
        await self.db.update_reports(report_id, new_config)

    @request_handler()
    async def add_exclude_tests(self, params: dict):
        tests = params['tests']
        name = params['name']
        report = await self.db.find_report_by_name(name)
        config = report['config']
        config['excludes'] = config.get('excludes', []) + tests
        await self.db.update_reports(report['report_id'], config)

    @request_handler()
    async def get_excluded_tests(self, params: dict):
        return {'tests': await self.db.get_excluded_tests(params['report_id'])}

    async def _delete_test(self, test_ids: list[str]):
        for test_id in test_ids:
            attachments = await self.db.get_attachments(test_id)
            self.log.debug('remove attachments')
            for attachment in attachments:
                get(f'http://{self.config.files_url}/files/remove?name={attachment["source"]}')
            await self.db.delete_test(test_id)

    @request_handler()
    async def delete_test(self, params: dict):
        loop = asyncio.get_event_loop()
        loop.create_task(self._delete_test(params['test_ids']))

    @request_handler()
    async def delete_report(self, params: dict):
        await self.db.delete_report(params['report_id'])
