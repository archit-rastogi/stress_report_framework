import asyncio
from datetime import datetime
from re import match

from modules.base import AbstractModule, request_handler, ModuleConfig


class MainModule(AbstractModule):
    def __init__(self, config: ModuleConfig):
        AbstractModule.__init__(self, config)
        self.calculating_report_history = {}
        self.calculating_pages = {}

    @request_handler()
    async def edit_tests_info(self, params: dict):
        await self.db.edit_tests_info(params['info'], params['test_ids'], params['status'])
        if params['status'] == 'failed':
            for test_id in params['test_ids']:
                await self.db.add_results(
                    test_id=test_id,
                    result_type='exception',
                    name='Status changed manually',
                    data={
                        'message': params['exception'],
                        'exception': params['exception'],
                    }
                )

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
    async def get_tests_info(self, params: dict):
        tests = await self.db.get_tests_by_ids(params['test_ids'])
        return {
            'tests_info': tests
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

    async def _set_value(self, ats: list, key, value, previous_key: str):
        key_path = key.split('/')
        if len(key_path) == 1:
            ats.append(value)
            return ats
        else:
            first_key = key_path[0]
            found_at = [at for at in ats if at["name"] == first_key]
            if found_at:
                found_at[0]["children"] = await self._set_value(
                    found_at[0]["children"], '/'.join(key_path[1:]), value, first_key
                )
            else:
                ats.append({
                    "name": key_path[0],
                    'source_key': f'{previous_key}{first_key}',
                    "children": await self._set_value([], '/'.join(key_path[1:]), value, f'{first_key}/')
                })
            return ats

    @request_handler()
    async def get_attachments(self, params: dict):
        test_id = params['test_id']
        attachments = await self.db.get_attachments(test_id)
        result = []
        for attachment in attachments:
            await self._set_value(result, attachment['name'], attachment, "")
        return {'attachments': result}

    @request_handler()
    async def add_report(self, params: dict):
        name: str = params['name']
        config: dict = params['config']
        reports = await self.db.get_reports(names=[name])
        return {'report_id': reports[0]['report_id'] if reports else await self.db.add_report(name, config)}

    @request_handler(post_params=False)
    async def get_reports(self):
        return {'reports': await self.db.get_reports()}

    @request_handler()
    async def get_report_tests(self, params: dict):
        name = params['name']
        selected_page = params.get('page')
        report = await self.db.find_report_by_name(name)
        filters = []
        if page_property := report['config'].get('page_property'):
            if (pages := report['config'].get('pages', None)) is None:
                return {'tests': [], 'wait_pages': True}
            elif pages:
                if selected_page in pages.keys():
                    filters.append({
                        'key': page_property,
                        'value': selected_page,
                        'comparator': '='
                    })
                else:
                    pages = await self._update_report_pages(report)
                    if selected_page in pages.keys():
                        filters.append({
                            'key': page_property,
                            'value': selected_page,
                            'comparator': '='
                        })
                    else:
                        pages_list = [[k, v] for k, v in pages.items()]
                        sorted_pages_list = sorted(pages_list, key=lambda k: k[1]['order'])
                        filters.append({
                            'key': page_property,
                            'value': sorted_pages_list[-1][0],
                            'comparator': '='
                        })

        return {'tests': await self.db.get_report_cases(
            report['report_id'],
            custom_filters=filters
        )}

    @request_handler()
    async def get_report_pages(self, params: dict):
        update_pages_every = 60
        name = params['name']
        report = await self.db.find_report_by_name(name)
        if not report:
            return {'status': False, 'reason': 'Failed to find report'}

        config = report['config']
        if config.get('page_property'):
            last_update = config.get('update_pages')
            if last_update is None:
                update_pages = True
            else:
                update_pages = (datetime.now().timestamp() - last_update) > update_pages_every
            if self.calculating_pages.get(report['report_id']):
                return
            self.calculating_pages[report['report_id']] = True
            try:
                if update_pages:
                    loop = asyncio.get_event_loop()
                    loop.create_task(self._update_report_data(report))
                    return {'pages': await self._update_report_pages(report)}
                else:
                    return {'pages': config['pages']}
            finally:
                self.calculating_pages[report['report_id']] = False

    async def _update_report_pages(self, report: dict) -> dict[str, dict[str, int]]:
        config = report['config']
        pages = await self.db.get_pages(config, page_property=config['page_property'])
        config['pages'] = pages
        config['update_pages'] = datetime.now().timestamp()
        await self.db.update_report_config(report['report_id'], config)
        return pages

    async def _update_report_data(self, report: dict):
        if self.calculating_report_history.get(report['report_id']):
            return
        try:
            self.calculating_report_history[report['report_id']] = True
            self.log.info(f'start calculate report {report["name"]}')
            pages = await self.db.get_pages(report['config'])
            data = {}
            pages_list = list(pages.items())
            pages_list.sort(key=lambda entity: entity[1]['order'])
            for page_name, page_data in pages_list[-30:]:
                filters = report['config'].get('filters', []) + [{
                    'key': report['config']['page_property'],
                    'value': page_name,
                }]
                tests = await self.db.get_tests(filters=filters)
                data[page_name] = [{
                    'order': int(test['config'][f"{report['config']['page_property']}_order"]),
                    'test_id': test['test_id'],
                    'status': test['status'],
                    'test_name': test['config']['test_name'],
                    'known_issues': test['config'].get('known_issues', None),
                } for test in tests]
            await self.db.update_report_data(report['report_id'], {
                "detailed_statistics": data,
                'update_ts': datetime.now().timestamp()
            })
            self.log.info(f'stop calculate report {report["name"]}')
        finally:
            self.calculating_report_history[report['report_id']] = False

    @request_handler()
    async def get_report_statistics(self, params: dict):
        return {'data': await self.db.get_report_data(params['name'])}

    @request_handler()
    async def update_report(self, params: dict):
        new_config = params['config']
        report_id = params['report_id']
        name = params['name']
        await self.db.update_report_config(report_id, new_config, name)

    @request_handler()
    async def add_exclude_tests(self, params: dict):
        tests = params['tests']
        name = params['name']
        report = await self.db.find_report_by_name(name)
        config = report['config']
        config['excludes'] = config.get('excludes', []) + tests
        await self.db.update_report_config(report['report_id'], config)

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

    async def _get_attachments_data(self, attachments: list[dict]):
        result = []
        for attachment in attachments:
            if attachment.get('attachment_id'):
                result.append(attachment)
            else:
                result.extend(await self._get_attachments_data(attachment['children']))
        added_id = []
        clean_result = []
        for result_attachment in result:
            if result_attachment['attachment_id'] not in added_id:
                added_id.append(result_attachment['attachment_id'])
                clean_result.append(result_attachment)
        return clean_result

    @request_handler()
    async def delete_attachments(self, params: dict):
        attachments = params['attachments']
        attachments_list = await self._get_attachments_data(attachments)
        for attachment in attachments_list:
            await self.remove_file(attachment['source'])

    @request_handler()
    async def add_test_properties(self, params: dict):
        test_ids: list[str] = params['test_ids']
        properties: dict[str, str] = params['properties']
        for test_id in test_ids:
            test = await self.db.get_test(test_id)
            for k, v in properties.items():
                test['config'][k] = v
            await self.db.edit_tests_info(test['config'], [test_id])

    @request_handler()
    async def remove_test_properties(self, params: dict):
        test_ids: list[str] = params['test_ids']
        properties: list[str] = params['properties']
        for test_id in test_ids:
            test = await self.db.get_test(test_id)
            for k in properties:
                if test['config'].get(k) is not None:
                    del test['config'][k]
            await self.db.edit_tests_info(test['config'], [test_id])

    @request_handler()
    async def get_test_history(self, params: dict):
        test_id = params['test_id']
        test = await self.db.get_test(test_id)
        t_config = test['config']
        reports = await self.db.get_reports()
        found_report_configs = []
        for report in reports:
            r_config = report['config']
            for f in r_config.get('filters', []):
                if report['config'].get('page_property') \
                        and f['key'] in t_config.keys() \
                        and match(f['value'], t_config[f['key']]) \
                        and t_config.get(report['config']['page_property']):
                    found_report_configs.append(report)

        for report in found_report_configs:
            report_tests = await self.db.get_report_cases(
                report_id=report['report_id'],
                custom_filters=[{
                    'key': 'test_name',
                    'value': f"^{test['config']['test_name']}$"
                }]
            )
            try:
                report_tests.sort(
                    key=lambda x: int(x['config'].get(f"{report['config']['page_property']}_order", 0))
                )
            except:
                self.log.error(f'error to sort history to {test_id=} report={report["report_id"]}')
            report['found_tests'] = report_tests[-20:]

        return {'found_reports': found_report_configs}
