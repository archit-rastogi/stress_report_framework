import asyncio
from datetime import datetime
from time import time

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
        metrics = await self.db.get_metrics(test_id)
        metrics_names = []
        for metric in metrics:
            metrics_names = list(set(metrics_names + list(metric['data'].keys())))
        return {'metrics': metrics_names}

    @request_handler()
    async def get_metric(self, params: dict):
        test_id = params['test_id']
        metric_name = params['metric_name']
        graph_type = params['graph_type']

        found_metrics = await self.db.get_metrics(test_id)
        name = None
        round_val = None
        symbol = None

        metrics = {}

        series_names = []

        for metric in found_metrics:
            metric_data = metric['data'].get(metric_name)
            if metric_data is None:
                continue
            if name is not None and (real_metric_name := metric_data.get('name')):
                name = real_metric_name
            if round_val is not None and (metric_round_val := metric_data.get('round_val')):
                round_val = metric_round_val
            if symbol is not None and (metric_symbol := metric_data.get('symbol')):
                symbol = metric_symbol

            metric_time = metric['time']
            lines_data: dict[str, dict[str, str]] = metric_data['data']
            series_names = list(set(series_names + list(lines_data.keys())))
            metrics[round(metric_time)] = lines_data

        lines: dict[str, list[list]] = {}
        sorted_metrics = sorted([[k, v] for k, v in metrics.items()], key=lambda k: k[0])

        for t, lines_data in sorted_metrics:
            for line_name, hosts in lines_data.items():
                if graph_type == 'separated':
                    for host, metric in hosts.items():
                        _line_number = f'{line_name} {host}'
                        lines[_line_number] = lines.get(_line_number, []) + [[t, metric]]
                elif graph_type == 'avg':
                    all_hosts_metrics = hosts.values()
                    lines[line_name] = lines.get(line_name, []) + [[t, sum(all_hosts_metrics)/len(all_hosts_metrics)]]
                elif graph_type == 'sum':
                    all_hosts_metrics = hosts.values()
                    lines[line_name] = lines.get(line_name, []) + [[t, sum(all_hosts_metrics)]]

        return {
            'symbol': symbol,
            'round_value': round_val,
            'series': lines
        }

    @request_handler()
    async def _get_metrics(self, params: dict):
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
