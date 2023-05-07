from copy import deepcopy
from datetime import datetime, timedelta
from random import choice, Random
from uuid import uuid4

from pyhocon import ConfigTree
from requests import post


def dict_merge(source, add):
    _source = deepcopy(source)
    for add_item in add:
        if isinstance(add[add_item], dict) and isinstance(_source.get(add_item), dict):
            dict_merge(_source[add_item], add[add_item])
        else:
            _source[add_item] = add[add_item]
    return _source


def dict_through(tree):
    tree = dict(tree)
    for k in tree:
        if isinstance(tree[k], ConfigTree):
            tree[k] = dict_through(tree[k])
    return tree


r = Random()

add_files = False

base_url = 'http://localhost:9999/back'


def handle_res(_res):
    assert _res['status'], _res.get('reason')


all_steps_names = [f'Step #{i}' for i in range(15)]

for page_ord, page in enumerate([f'day {i}' for i in range(2)]):
    for i in range(r.randint(1, 10)):
        print(f"insert test {i}")
        test_config = {
            "test_name": f"test {i}",
            'report': 'test_report',
            'page': page,
            'page_order': page_ord,
            **{f'key {i}': f'value {i}' for i in range(r.randint(0, 10))},
            **({'known_issues': ','.join(
                [f'https://github.com/yugabyte/yugabyte-db/issues/{r.randint(1, 10000)}' for ki in range(r.randint(1, 3))]
            )} if r.randint(0, 5) == 4 else {})
        }
        if r.randint(0, 10) == 6:
            del test_config['page_order']
        if r.randint(0, 20) == 6:
            del test_config['page']
        start_test_res = post(f'{base_url}/start_test', json={
            'config': test_config,
            'start_time': datetime.now().timestamp()
        }).json()
        handle_res(start_test_res)
        test_id = start_test_res['test_id']

        step_names = {}
        not_ended_steps = []

        for s in range(r.randint(3, 10)):
            prop = {str(f'prop {i}'): f'value {i}' for i in range(3)}
            step_name = choice(all_steps_names)
            if step_name in not_ended_steps:
                continue
            prop['name'] = step_name

            if latest_step_end_time := step_names.get(step_name):
                start_d = datetime.fromtimestamp(latest_step_end_time) + timedelta(minutes=r.randint(1, 30))
            else:
                start_d = datetime.now() + timedelta(minutes=r.randint(1, 30))

            print(f"insert step {s}")
            start_step_res = post(f'{base_url}/start_step', json={
                "test_id": test_id,
                'properties': prop,
                'start_time': start_d.timestamp()
            }).json()
            handle_res(start_step_res)
            step_id = start_step_res['step_id']

            if r.randint(1, 10) == 4:
                not_ended_steps.append(step_name)
                continue

            end_step_time = (start_d + timedelta(minutes=r.randint(1, 30))).timestamp()
            end_step_res = post(f'{base_url}/end_step', json={
                "step_id": step_id,
                'status': choice(['passed', 'failed']),
                'end_time': end_step_time
            }).json()
            step_names[step_name] = end_step_time
            handle_res(end_step_res)

        ts = datetime.now()
        for m in range(r.randint(20, 60)):
            ts += timedelta(seconds=30)
            m_data = {}
            for line_name, symbol, round_val in [
                ["cpu", '%', 0],
                ["mem", 'GB', 2],
                ["sql", 'Ops', 0],
                ["cql", 'Ops', 0],
                ["net", 'packs', 0],
                ["net bytes", 'GB', 3],
                ["disk", 'Ops', 0],
                ["disk bytes", 'MB', 3],
            ]:

                m_data[f'[{line_name[:1]}] {line_name}'] = {
                    'data': {
                        thr: {h: 0 if (metric := r.randint(-1000, 10000)) < 0 else metric for h in [f"172.25.1.{h}" for h in range(9)]}
                        for thr in choice([["system", 'user'], ["ss", 'qq', 'aa'], ["aa", "hh", 'zz']])
                    },
                    'name': line_name,
                    'symbol': symbol,
                    'round_val': round_val
                }
            print(f"insert metric {m}")
            add_metric_res = post(f'{base_url}/add_metric', json={
                'data': m_data,
                'test_id': test_id,
                'time': ts.timestamp()
            }).json()
            handle_res(add_metric_res)

        if add_files:
            for a in range(r.randint(10, 30)):
                path = choice(["a/s/d asd asd/f/", 'a/sasd asd/d/', 'a/asd s/', 'a/', ''])
                file_name = f'{str(uuid4())}-test.log'
                print(f'add file {file_name}')
                file_add_res = post("http://localhost:9998/files/add", files={
                    "file": b'asdasdasd\ntesttest\testtest\ntsadsda'
                }, headers={"name": file_name})
                assert file_add_res.status_code == 200, f'Cant add file {file_name}'
                print(f'add attachment {a}')
                att_res = post(f'{base_url}/add_attachment', json={
                    'name': f"{path}Attachment {str(uuid4())[:6]}",
                    'source': file_name,
                    'type': 'file',
                    'test_id': test_id
                })
                handle_res(att_res.json())

        for res_idx in range(r.randint(1, 5)):
            print(f'add result {res_idx + 1}')
            data = []
            columns = [f'Column #{c}' for c in range(r.randint(3, 10))]
            data.append(columns)
            for num in range(r.randint(3, 20)):
                data.append([f'row name #{num}'] + [str(r.randint(1, 10000000)) if r.randint(1, 20) < 19 else {
                    'status': r.choice(['passed', 'failed']),
                    'value': str(r.randint(1, 10000000))
                } for i in range(len(columns) - 1)])
            att_res = post(f'{base_url}/add_test_results', json={
                'name': f"Result {str(uuid4())[:6]}",
                'data': data,
                'type': 'table',
                'test_id': test_id
            })
            handle_res(att_res.json())

            att_res = post(f'{base_url}/add_test_results', json={
                'name': f"Result {str(uuid4())[:6]}",
                'data': {
                    'message': f'Failed some workload {uuid4()}',
                    'exception': ' '.join([choice([*('failed here message something going bad'.split(' ')), '\n', '\t']) for i in range(r.randint(10, 300))])
                },
                'type': 'exception',
                'test_id': test_id
            })
            handle_res(att_res.json())

        if r.randint(1, 10) == 5:
            continue
        end_test_res = post(f'{base_url}/end_test', json={
            'test_id': test_id,
            'status': choice(["passed", 'failed']),
            'end_time': (datetime.now() + timedelta(minutes=r.randint(20, 180))).timestamp()
        }).json()
        handle_res(end_test_res)
