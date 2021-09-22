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

base_url = 'http://localhost:9999/back'


def handle_res(_res):
    assert _res['status'], _res.get('reason')


all_steps_names = [f'Step #{i}' for i in range(15)]

for i in range(34):
    print(f"insert test {i}")
    start_test_res = post(f'{base_url}/start_test', json={
        'config': {
            "name": f"test {i}"
        },
        'start_time': datetime.now().timestamp()
    }).json()
    handle_res(start_test_res)
    test_id = start_test_res['test_id']

    step_names = {}
    not_ended_steps = []

    for s in range(r.randint(3, 50)):
        prop = {str(f'prop {i}'): f'value {i}' for i in range(5)}
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

        if r.randint(1, 20) == 5:
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
    for m in range(r.randint(100, 150)):
        ts += timedelta(seconds=30)
        m_data = {}
        for line_name, symbol, round_val in [
            ["cpu", '%', 0],
            ["mem", 'GB', 2],
            ["sql", 'Ops', 0],
            ["cql", 'Ops', 0]
        ]:
            m_data[line_name] = {
                'data': {
                    thr: {h: r.randint(10, 1000) for h in [f"172.25.1.{h}" for h in range(3)]}
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

    for a in range(r.randint(10, 30)):
        path = choice(["a/s/d/f/", 'a/s/d/', 'a/s/', 'a/', ''])
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
        att_res
        handle_res(att_res.json())

    if r.randint(1, 10) == 5:
        continue
    end_test_res = post(f'{base_url}/end_test', json={
        'test_id': test_id,
        'status': choice(["passed", 'failed']),
        'end_time': (datetime.now() + timedelta(minutes=r.randint(20, 50))).timestamp()
    }).json()
    handle_res(end_test_res)
