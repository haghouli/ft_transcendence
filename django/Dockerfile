FROM python

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		postgresql-client \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir certs
COPY ./certs/* /certs/

RUN mkdir backend
COPY ./backend/ /backend/
WORKDIR backend

COPY ./backend/requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 8000

RUN pip install hypercorn

CMD python manage.py migrate && \
    hypercorn --bind 0.0.0.0:8000 \
    --certfile /certs/dev.local.crt \
    --keyfile /certs/dev.local.key \
    my_project.asgi:application