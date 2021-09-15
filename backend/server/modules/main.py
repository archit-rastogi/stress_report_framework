from datetime import datetime, timedelta

from backend.server.modules.base import AbstractModule, request_handler


class MainModule(AbstractModule):

    @request_handler()
    async def start_run(self, params: dict):
        config = params['config']
        start_time = params.get('start_time')
        start_time = datetime.fromtimestamp(start_time) if start_time else datetime.now()
        run_id = await self.db.start_run(config, start_time)
        return {
            'status': True,
            'run_id': run_id
        }

    @request_handler()
    async def end_run(self, params: dict):
        run_id = params['run_id']
        status = params['status']
        end_time = params['end_time']
        end_time = datetime.fromtimestamp(end_time)
        await self.db.end_run(run_id, status, end_time)

    @request_handler()
    async def start_step(self, params):
        run_id = params['run_id']
        properties = params['properties']
        m_time = params.get('start_time')
        m_time = datetime.fromtimestamp(m_time) if m_time else datetime.now()
        step_id = await self.db.start_step(run_id, properties, m_time)
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
        run_id = params['run_id']
        m_time = params.get('time')
        m_time = datetime.fromtimestamp(m_time) if m_time else datetime.now()
        await self.db.add_metric(data, run_id, m_time)

    @request_handler()
    async def get_runs(self, params: dict):
        start_date = datetime.fromtimestamp(params['date'])
        start_date = start_date - timedelta(
            hours=-1 * start_date.hour,
            seconds=-1 * start_date.second,
            minutes=-1 * start_date.minute
        )
        end_date = start_date + timedelta(days=1)
        return {
            'status': True,
            'runs': await self.db.get_runs(start_date, end_date)
        }

    @request_handler(get_params=True, post_params=False)
    async def get_steps(self, params: dict):
        run_id = params['run_id']
        return {
            'status': True,
            'steps': await self.db.get_steps(run_id)
        }

    @request_handler(get_params=True, post_params=False)
    async def get_metrics(self, params: dict):
        run_id = params['run_id']
        return {
            'status': True,
            'metrics': await self.db.get_metrics(run_id)
        }
