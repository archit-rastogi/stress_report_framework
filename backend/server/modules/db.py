import logging
from datetime import datetime
from json import dumps, loads
from typing import List
from uuid import uuid4

from asyncpg import Connection, Record, InterfaceError, connect


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
        res = []
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
        await self.execute(f"insert into metrics(metric_id, time, data, test_id) "
                           f"values ('{uuid4()}', $1, '{dumps(data)}', '{test_id}')", [m_time])

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

    async def get_steps(self, test_id: str) -> list[dict]:
        rows = await self.execute(f"select step_id, status, properties, start_time, end_time, test_id "
                                  f"from steps where test_id = '{test_id}' order by start_time")
        for row in rows:
            row['start_time'] = row['start_time'].timestamp()
            row['end_time'] = row['end_time'].timestamp() if row.get('end_time') else None
            row['properties'] = loads(row['properties'])
        return rows

    async def get_metrics(self, test_id: str) -> list[dict]:
        rows = await self.execute("select metric_id, time, data, test_id "
                                  f"from metrics where test_id = '{test_id}' order by time")
        for row in rows:
            row['time'] = row['time'].timestamp()
            row['data'] = loads(row['data'])
        return rows

    async def add_attachment(self, name, source, attachment_type, test_id, timestamp: datetime = None) -> str:
        attachment_id = str(uuid4())
        if timestamp is None:
            timestamp = datetime.now()
        await self.execute("insert into attachments(attachment_id, name, time, source, type, test_id) "
                           f"values ('{attachment_id}', '{name}', $1, '{source}', '{attachment_type}', '{test_id}')",
                           params=[timestamp])
        return attachment_id

    async def get_attachments(self, test_id) -> list[dict]:
        rows = await self.execute("select attachment_id, name, time, source, type, test_id "
                                  f"from attachments where test_id = '{test_id}' order by time")
        for row in rows:
            row['time'] = row['time'].timestamp()
        return rows

    async def add_report(self, name):
        report_id = str(uuid4())
        await self.execute(f'insert into stress_report(report_id, name, config, cases, creation_time) '
                           f"values ('{report_id}', '{name}', '{{}}', '[]', $1)", [datetime.now()])
        return report_id

    async def add_report_case(self, report_id: str, case_id: str):
        rows = await self.execute(f"select cases from stress_report where report_id = '{report_id}'")
        cases = loads(rows[0]['cases'])
        cases.append(case_id)
        await self.execute(f"update stress_report set cases = '{dumps(cases)}' where report_id = '{report_id}'")

    async def get_reports(self):
        rows = await self.execute("select report_id, name, config, cases, creation_time "
                                  "from stress_report order by creation_time")
        for row in rows:
            row['cases'] = loads(row['cases'])
            row['creation_time'] = row['creation_time'].timestamp()
        return rows

    async def get_report_cases(self, report_name) -> list[dict]:
        rows = await self.execute(f"select cases from stress_report where name = '{report_name}'")
        cases: list[str] = loads(rows[0]['cases'])
        cases_data = []
        for case_id in cases:
            case_data_rows = await self.execute(f"select test_id, config, start_time, end_time, status "
                                                f"from stress_tests where test_id = '{case_id}'")

            case_data = case_data_rows[0]
            case_data['start_time'] = case_data['start_time'].timestamp()
            case_data['end_time'] = case_data['end_time'].timestamp() if case_data.get('end_time') else None
            case_data['config'] = loads(case_data['config'])
            cases_data.append(case_data)
        return cases_data
