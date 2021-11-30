import asyncio
import logging
from datetime import datetime
from json import dumps, loads
from pathlib import Path
from re import sub
from typing import List
from uuid import uuid4

from asyncpg import Connection, Record, InterfaceError, connect, UndefinedTableError, ConnectionDoesNotExistError


class QueryExecute:

    def __init__(self, log: logging.Logger, host, port, database, user,
                 setup_file_path: str = None):
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
        self.setup_file_path = setup_file_path
        self.first_query = True

    async def _setup_db(self, queries):
        try:
            await self.get_reports()
        except UndefinedTableError:
            self.log.info("create DB")
            for query in queries:
                await self.execute(query)

    async def connect(self):
        self.log.info('open new connections')
        for _ in range(5):
            self.open_connections.append(await connect(**self.connection_params))
        self.log.info('opened new 5 connections')

    async def execute(self, query: str, params: list or tuple = None, trycount=0):
        if not self.open_connections:
            await self.connect()
            if self.first_query and self.setup_file_path:
                setup_file = Path(self.setup_file_path)
                if setup_file.exists():
                    loop = asyncio.get_event_loop()
                    loop.create_task(
                        self._setup_db(sub(r'\s+', ' ', setup_file.read_text().replace('\n', ' ')).split(';'))
                    )
                    self.first_query = False
        connection = self.open_connections.pop()

        if params is None:
            params = []
        failed_connection = False
        res = []
        try:
            res: List[Record] = await connection.fetch(query, *params)
        except InterfaceError:
            failed_connection = True
        except ConnectionDoesNotExistError:
            if trycount < 100:
                return await self.execute(query, params, trycount + 1)

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

    async def get_test(self, test_id: str):
        rows = await self.execute(f"select test_id, config, start_time, end_time, status from stress_tests where test_id = '{test_id}'")
        test = rows[0]
        await self.format_test(test)
        return test

    async def get_tests(self, start_date: datetime, end_date: datetime, filters: list[dict] = None) -> list[dict]:
        filter_condition = ''
        if filters:
            filter_condition += ' and '
            filter_condition += ' and '.join([f"config->'{f['key']}' is not null and config->>'{f['key']}' ~ '{f['value']}'" for f in filters])
        rows = await self.execute('select test_id, config, start_time, end_time, status from stress_tests '
                                  f'where start_time between $1 and $2 {filter_condition} '
                                  'order by start_time desc', [start_date, end_date])
        for row in rows:
            row['start_time'] = row['start_time'].timestamp()
            row['end_time'] = row['end_time'].timestamp() if row.get('end_time') else None
            row['config'] = loads(row['config'])
        return rows

    async def delete_test(self, test_id: str):
        await self.execute(f"delete from stress_tests where test_id = '{test_id}'")

    async def delete_report(self, report_id: str):
        await self.execute(f"delete from stress_report where report_id = '{report_id}'")

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

    async def get_attachments(self, test_id, name=None) -> list[dict]:
        condition = ''
        if name is not None:
            condition = f"and name = '{name}'"
        rows = await self.execute("select attachment_id, name, time, source, type, test_id "
                                  f"from attachments where test_id = '{test_id}' {condition} order by time")
        for row in rows:
            row['time'] = row['time'].timestamp()
        return rows

    async def update_attachment(self, attachment_id: str, new_source: str):
        await self.execute(f"update attachments set source = '{new_source}' where attachment_id = '{attachment_id}'")

    async def add_report(self, name: dict, config: dict):
        report_id = str(uuid4())
        await self.execute(f'insert into stress_report(report_id, name, config, creation_time) '
                           f"values ('{report_id}', '{name}', '{dumps(config)}', now()::timestamp)")
        return report_id

    async def add_report_case(self, report_id: str, case_id: str):
        rows = await self.execute(f"select config from stress_report where report_id = '{report_id}'")
        config = loads(rows[0]['config'])
        config['cases'] = config.get('cases', []) + [case_id]
        await self.execute(f"update stress_report set config = '{dumps(config)}' where report_id = '{report_id}'")

    async def get_reports(self, report_ids: list[str] = None, names: list[str] = None) -> list:
        conditions = []
        if report_ids:
            reports = ", ".join([f"'{report_id}'" for report_id in report_ids])
            conditions.append(f'report_id in ({reports})')
        if names:
            names = ", ".join([f"'{name}'" for name in names])
            conditions.append(f'name in ({names})')
        condition = ''
        if conditions:
            condition = f'where {" and ".join(conditions)}'
        rows = await self.execute("select report_id, name, config, creation_time "
                                  f"from stress_report {condition} order by creation_time")
        for row in rows:
            row['config'] = loads(row['config'])
            row['creation_time'] = row['creation_time'].timestamp()

        return rows

    async def update_reports(self, report_id: str, new_config: dict):
        await self.execute(f"update stress_report set config = '{dumps(new_config)}' where report_id = '{report_id}'")

    async def find_report_by_name(self, report_name) -> dict:
        rows = await self.execute(f"select name, config, report_id from stress_report where name = '{report_name}'")
        rows[0]['config'] = loads(rows[0]['config'])
        return rows[0]

    async def format_test(self, case: dict):
        case['start_time'] = case['start_time'].timestamp()
        case['end_time'] = case['end_time'].timestamp() if case.get('end_time') else None
        case['config'] = loads(case['config'])

    async def get_report_cases(self, report_id) -> list[dict]:
        rows = await self.execute(f"select config from stress_report where report_id = '{report_id}'")
        config: dict = loads(rows[0]['config'])
        cases_data = []

        for case_id in config.get('cases', []):
            case_data_rows = await self.execute(f"select test_id, config, start_time, end_time, status "
                                                f"from stress_tests where test_id = '{case_id}'")

            case_data = case_data_rows[0]
            await self.format_test(case_data)
            cases_data.append(case_data)

        filters_condition = []
        if config.get('filters', []):
            filters_condition.append(
                ' and '.join([f"config->'{f['key']}' is not null and config->>'{f['key']}' ~ '{f['value']}'" for f in config.get('filters', [])]))

        args = []
        if config.get('dates', []):
            dates_condition = []
            for condition_date in config['dates']:
                dates_condition.append(f'start_time between ${len(args) + 1} and ${len(args) + 2} ')
                args.append(datetime.fromtimestamp(condition_date['start']))
                args.append(datetime.fromtimestamp(condition_date['end']))
            filters_condition.append(f'({"or".join(dates_condition)}) ')
        excludes: list[str] = config.get('excludes', [])
        case_data_rows = await self.execute(f"select test_id, config, start_time, end_time, status "
                                            f"from stress_tests where {'and '.join(filters_condition)}", args)
        for case_data in case_data_rows:
            if case_data['test_id'] not in excludes:
                await self.format_test(case_data)
                cases_data.append(case_data)

        return cases_data

    async def get_excluded_tests(self, report_id: str) -> list:
        reports = await self.get_reports(report_ids=[report_id])
        report = reports[0]
        excludes = report['config'].get('excludes', [])
        excludes_condition = "', '".join(excludes)
        tests = await self.execute(f"select test_id, config, start_time, end_time, status  "
                                   f"from stress_tests where test_id in ('{excludes_condition}')")
        for test in tests:
            await self.format_test(test)
        return tests

    async def get_universe_configs(self) -> list[dict[str]]:
        return await self.execute('select universe_config_id, source, name from universe_configs')

    async def add_universe_config(self, name, source):
        return await self.execute('insert into universe_configs(universe_config_id, source, name) '
                                  f"values('{uuid4()}', '{source}', '{name}')")

    async def delete_universe_config(self, config_id: str):
        return await self.execute(f"delete from universe_configs where universe_config_id = '{config_id}'")
