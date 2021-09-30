import logging
from datetime import datetime
from traceback import format_exc

from aiohttp import web
from aiohttp.web_request import Request

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
                result = await func(self, **function_kwargs)
            except Exception as e:
                msg = f'{e}\n{format_exc()}'
                self.log.error(msg)
                return web.json_response({'status': False, 'reason': msg})
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
