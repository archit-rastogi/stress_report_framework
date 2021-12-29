import asyncio
from datetime import datetime
from json import dumps

from requests import post

from modules.base import AbstractModule, request_handler


class MainModule(AbstractModule):

    @request_handler()
    async def edit_test_info(self, params: dict):
        await self.db.edit_test_info(params['info'], params['test_id'])

    @request_handler()
    async def get_tests(self, params: dict):
        start = datetime.fromtimestamp(params['start'])
        end = datetime.fromtimestamp(params['end'])
        filters = params.get('filters')
        return {'tests': await self.db.get_tests(start, end, filters=filters)}

    @request_handler()
    async def get_test_info(self, params: dict):
        test_id = params['test_id']
        return {
            'test_info': await self.db.get_test(test_id)
        }

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
            if name is None and (real_metric_name := metric_data.get('name')):
                name = real_metric_name
            if round_val is None and (metric_round_val := metric_data.get('round_val')):
                round_val = metric_round_val
            if symbol is None and (metric_symbol := metric_data.get('symbol')):
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
                    lines[line_name] = lines.get(line_name, []) + [[t, sum(all_hosts_metrics) / len(all_hosts_metrics)]]
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
                await self.remove_file(attachment["source"])
            await self.db.delete_test(test_id)

    @request_handler()
    async def delete_test(self, params: dict):
        loop = asyncio.get_event_loop()
        loop.create_task(self._delete_test(params['test_ids']))

    @request_handler()
    async def delete_report(self, params: dict):
        await self.db.delete_report(params['report_id'])

    @request_handler()
    async def add_universe_config(self, params: dict):
        config_data = params['config']
        name = params['name']
        post(f'http://{self.config.files_url}/files/add', files={
            "file": dumps(config_data).encode('utf-8')
        }, headers={"name": name})

        await self.db.add_universe_config(name, name)

    @request_handler()
    async def get_universe_configs(self, params: dict):
        return {
            'configs': await self.db.get_universe_configs()
        }

    @request_handler()
    async def delete_universe_config(self, params: dict):
        await self.db.delete_universe_config(params['id'])
        await self.remove_file(params['source'])

    @request_handler()
    async def add_test_results(self, params: dict):
        test_id = params['test_id']
        data = params['data']
        name = params['name']
        result_type = params.get('type', 'table')
        results = await self.db.get_results(test_id)
        if results and (same_results := [r for r in results if r['name'] == name]):
            await self.db.update_result(same_results[0]['result_id'], data)
        else:
            await self.db.add_results(test_id, name, data, result_type)

    @request_handler()
    async def get_test_results(self, params: dict):
        test_id = params['test_id']
        return {
            'results': await self.db.get_results(test_id)
        }

    @request_handler()
    async def delete_attachments(self, params: dict):
        attachments = params['attachments']
        for attachment in attachments:
            await self.remove_file(attachment['source'])
