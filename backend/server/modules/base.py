import logging
from datetime import datetime
from json import dumps, loads
from traceback import format_exc
from typing import List
from uuid import uuid4

from aiohttp import web
from aiohttp.web_request import Request
from asyncpg import Connection, Record, InterfaceError, connect


def request_handler(post_params=True, request_require=False, get_params=False):
    def wrapper(func):
        async def handler(self, request: Request):
            function_kwargs = {}
            if post_params:
                function_kwargs['params'] = await self.get_params(request)
            elif get_params:
                function_kwargs['params'] = request.rel_url.query
            if request_require:
                function_kwargs['request'] = request
            try:
                result = await func(self, **function_kwargs)
            except Exception as e:
                msg = f'{e}\n{format_exc()}'
                self.log.error(msg)
                return web.json_response({'status': False, 'reason': msg})
            if result is None:
                result = {'status': True}
            if isinstance(result, dict):
                result = await self.serialize(result)
                result = web.json_response(result)
            return result

        return handler

    return wrapper


class QueryExecute:

    def __init__(self, log: logging.Logger, host, port, database, user):
        self.log: logging.Logger = log
        self.connection_params = {
            'host': host,
            'port': port,
            'database': database,
            'user': user
        }
        self.host = host
        self.port = port
        self.open_connections: List[Connection] = []

    async def connect(self):
        self.log.info('open new connections')
        for _ in range(5):
            self.open_connections.append(await connect(**self.connection_params))
        self.log.info('opened new 5 connections')

    async def execute(self, query: str, params: list or tuple = None):
        if not self.open_connections:
            await self.connect()
        connection = self.open_connections.pop()

        if params is None:
            params = []
        failed_connection = False
        try:
            res: List[Record] = await connection.fetch(query, *params)
        except InterfaceError:
            failed_connection = True

        if not failed_connection:
            if len(self.open_connections) < 5:
                self.open_connections.append(connection)
        else:
            await connection.close()
        rows = []
        for record_row in res:
            rows.append(dict(record_row.items()))
        return rows

    async def start_test(self, config: dict, start_time: datetime = None) -> str:
        test_id = str(uuid4())
        await self.execute('insert into stress_tests(test_id, config, start_time, status) '
                           f"values ('{test_id}', '{dumps(config)}', $1, 'running')", [start_time])
        return test_id

    async def end_test(self, test_id: str, status: str, end_time: datetime):
        await self.execute(f"update stress_tests set status='{status}', end_time=$1 "
                           f"where test_id = '{test_id}'", [end_time])

    async def start_step(self, test_id: str, properties: dict, start_time: datetime) -> str:
        step_id = str(uuid4())
        await self.execute('insert into steps(step_id, properties, start_time, test_id, status) '
                           f"values ('{step_id}', '{dumps(properties)}', $1, '{test_id}', 'running')",
                           [start_time])
        return step_id

    async def end_step(self, step_id: str, status: str, end_time: datetime):
        await self.execute(f"update steps set status='{status}', end_time=$1 where step_id = '{step_id}'", [end_time])

    async def add_metric(self, data: dict, test_id: str, m_time: datetime):
        metric_id = str(uuid4())
        await self.execute(f"insert into metrics(metric_id, time, data, test_id) "
                           f"values ('{metric_id}', $1, '{dumps(data)}', '{test_id}')", [m_time])

    async def get_tests(self, start_date: datetime, end_date: datetime) -> list[dict]:
        rows = await self.execute('select test_id, config, start_time, end_time, status '
                                  'from stress_tests '
                                  'where start_time between $1 and $2'
                                  'order by start_time desc', [start_date, end_date])
        for row in rows:
            row['start_time'] = row['start_time'].timestamp()
            row['end_time'] = row['end_time'].timestamp() if row.get('end_time') else None
            row['config'] = loads(row['config'])
        return rows

    async def get_steps(self, test_id: str):
        rows = await self.execute(f"select step_id, status, properties, start_time, end_time, test_id "
                                  f"from steps where test_id = '{test_id}' order by start_time")
        for row in rows:
            row['start_time'] = row['start_time'].timestamp()
            row['end_time'] = row['end_time'].timestamp() if row.get('end_time') else None
            row['properties'] = loads(row['properties'])
        return rows

    async def get_metrics(self, test_id: str):
        rows = await self.execute("select metric_id, time, data, test_id "
                                  f"from metrics where test_id = '{test_id}' order by time")
        for row in rows:
            row['time'] = row['time'].timestamp()
            row['data'] = loads(row['data'])
        return rows


class AbstractModule:
    def __init__(self, host: str, port: int, database: str, user: str):
        self.log = logging
        self.log.basicConfig(level=logging.INFO)
        self.db = QueryExecute(self.log, host, port, database, user)

    async def get_params(self, request: Request):
        return await request.json()

    async def serialize(self, doc: dict):
        new_doc = {}
        if not isinstance(doc, dict):
            if isinstance(doc, datetime):
                doc = doc.timestamp()
            return doc

        for k, v in doc.items():
            if isinstance(v, datetime):
                new_doc[k] = v.timestamp()
            elif isinstance(v, dict):
                new_doc[k] = await self.serialize(v)
            elif isinstance(v, list):
                new_doc[k] = [await self.serialize(item) for item in v]
            else:
                new_doc[k] = v
        return new_doc
