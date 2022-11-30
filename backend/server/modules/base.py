import logging
import sys
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime
from traceback import format_exc

from aiohttp import web
from aiohttp.web_request import Request
from requests import post

from modules.db import QueryExecute


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
                if function_kwargs.get('params'):
                    params_to_show = deepcopy(function_kwargs["params"])
                    if 'add_metric' in func.__name__:
                        if params_to_show.get('data'):
                            del params_to_show['data']
                    self.log.info(f'[{func.__name__}] {params_to_show}')
                result = await func(self, **function_kwargs)
            except Exception as e:
                msg = f'{e}\n{format_exc()}'
                self.log.error(msg)
                return web.json_response({'status': False, 'reason': msg}, status=500)
            if result is None:
                result = {'status': True}
            if isinstance(result, dict):
                if result.get('status') is None:
                    result['status'] = True
                result = await self.serialize(result)
                result = web.json_response(result)
            return result

        return handler

    return wrapper


@dataclass
class ModuleConfig:
    db_host: str
    db_port: int
    db_username: str
    db_name: str
    files_url: str
    setup_file_path: str = None


class AbstractModule:
    def __init__(self, config: ModuleConfig):
        self.log = self._init_logger()
        self.config = config
        self.db = QueryExecute(
            self.log,
            self.config.db_host,
            self.config.db_port,
            self.config.db_name,
            self.config.db_username,
            setup_file_path=config.setup_file_path
        )

    def _init_logger(self):
        f = logging.Formatter('%(asctime)s:%(levelname)5s: %(message)s')
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(f)

        _logger = logging.getLogger("stress")
        _logger.handlers.clear()
        _logger.setLevel(logging.DEBUG)
        _logger.addHandler(console_handler)
        return _logger

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

    async def remove_file(self, source):
        res = post(f"http://{self.config.files_url}/files/remove?name={source}")
        return res.status_code == 200
