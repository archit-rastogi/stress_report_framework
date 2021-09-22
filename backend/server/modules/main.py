from datetime import datetime, timedelta

from modules.base import AbstractModule, request_handler


class MainModule(AbstractModule):

    @request_handler()
    async def start_test(self, params: dict):
        config = params['config']
        start_time = params.get('start_time')
        start_time = datetime.fromtimestamp(start_time) if start_time else datetime.now()
        test_id = await self.db.start_test(config, start_time)
        return {
            'status': True,
            'test_id': test_id
        }

    @request_handler()
    async def end_test(self, params: dict):
        test_id = params['test_id']
        status = params['status']
        end_time = params['end_time']
        end_time = datetime.fromtimestamp(end_time)
        await self.db.end_test(test_id, status, end_time)

    @request_handler()
    async def start_step(self, params):
        test_id = params['test_id']
        properties = params['properties']
        m_time = params.get('start_time')
        m_time = datetime.fromtimestamp(m_time) if m_time else datetime.now()
        step_id = await self.db.start_step(test_id, properties, m_time)
        return {
            'status': True,
            'step_id': step_id
        }

    @request_handler()
    async def end_step(self, params):
        step_id = params['step_id']
        status = params['status']
        end_time = params['end_time']
        end_time = datetime.fromtimestamp(end_time)
        await self.db.end_step(step_id, status, end_time)

    @request_handler()
    async def add_metric(self, params):
        data = params['data']
        test_id = params['test_id']
        m_time = params.get('time')
        m_time = datetime.fromtimestamp(m_time) if m_time else datetime.now()
        await self.db.add_metric(data, test_id, m_time)

    @request_handler()
    async def get_tests(self, params: dict):
        start_date = datetime.fromtimestamp(params['date'])
        start_date = start_date - timedelta(
            hours=-1 * start_date.hour,
            seconds=-1 * start_date.second,
            minutes=-1 * start_date.minute
        )
        end_date = start_date + timedelta(days=1)
        return {
            'status': True,
            'tests': await self.db.get_tests(start_date, end_date)
        }

    @request_handler(get_params=True, post_params=False)
    async def get_steps(self, params: dict):
        test_id = params['test_id']
        return {
            'status': True,
            'steps': await self.db.get_steps(test_id)
        }

    @request_handler(get_params=True, post_params=False)
    async def get_metrics(self, params: dict):
        test_id = params['test_id']
        return {
            'status': True,
            'metrics': await self.db.get_metrics(test_id)
        }

    @request_handler()
    async def add_attachment(self, params: dict):
        name = params['name']
        source = params['source']
        attachment_type = params['type']
        test_id = params['test_id']
        timestamp = params.get('timestamp', None)
        if timestamp is not None:
            timestamp = datetime.fromtimestamp(timestamp)

        attachment_id = await self.db.add_attachment(name, source, attachment_type, test_id, timestamp)
        return {
            'status': True,
            'attachment_id': attachment_id
        }

    @request_handler(get_params=True, post_params=False)
    async def get_attachments(self, params: dict):
        test_id = params['test_id']
        return {
            'status': True,
            'attachments': await self.db.get_attachments(test_id)
        }
