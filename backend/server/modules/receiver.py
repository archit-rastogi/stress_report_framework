from datetime import datetime

from modules.base import AbstractModule, request_handler


class ReceiverModule(AbstractModule):

    @request_handler()
    async def start_test(self, params: dict):
        config = params['config']
        start_time = params.get('start_time')
        start_time = datetime.fromtimestamp(start_time) if start_time else datetime.now()
        test_id = await self.db.start_test(config, start_time)
        return {'test_id': test_id}

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
        return {'step_id': step_id}

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
    async def add_attachment(self, params: dict):
        name = params['name']
        source = params['source']
        attachment_type = params['type']
        test_id = params['test_id']
        timestamp = params.get('timestamp', None)
        if timestamp is not None:
            timestamp = datetime.fromtimestamp(timestamp)

        if found_attachments := await self.db.get_attachments(test_id, name):
            found_attachment = found_attachments[0]
            await self.remove_file(found_attachment['source'])
            await self.db.update_attachment(found_attachment['attachment_id'], source)
            return {'attachment_id': found_attachment['attachment_id']}
        else:
            attachment_id = await self.db.add_attachment(name, source, attachment_type, test_id, timestamp)
            return {'attachment_id': attachment_id}

    @request_handler()
    async def edit_test_config(self, params: dict):
        test_id = params['test_id']
        new_config = params['config']
        test = await self.db.get_test(test_id)
        for k, v in new_config.items():
            test['config'][k] = v
        await self.db.edit_tests_config(test['config'], [params['test_id']])

    @request_handler()
    async def edit_step(self, params: dict):
        await self.db.edit_step(params['step_id'], params['properties'])
