create table IF NOT EXISTS stress_tests
(
    test_id    text primary key,
    config     jsonb,
    start_time timestamp without time zone,
    end_time   timestamp without time zone,
    status     text
);

create table IF NOT EXISTS steps
(
    step_id    text primary key,
    status     text,
    properties jsonb,
    start_time timestamp without time zone,
    end_time   timestamp without time zone,
    test_id    text,

    constraint fk_test_id foreign key (test_id)
        references stress_tests (test_id)
            match full
        on delete cascade
        on update restrict
);

create table IF NOT EXISTS metrics
(
    metric_id text primary key,
    time      timestamp without time zone,
    data      jsonb,
    test_id   text,
    constraint fk_test_id foreign key (test_id)
        references stress_tests (test_id)
            match full
        on delete cascade
        on update restrict
);

CREATE INDEX IF NOT EXISTS stress_idx ON stress_tests (start_time ASC, end_time ASC);

create table IF NOT EXISTS attachments
(
    attachment_id text primary key,
    name          text,
    time          timestamp without time zone,
    source        text,
    type          text,
    test_id       text,

    constraint fk_test_id foreign key (test_id)
        references stress_tests (test_id)
            match full
        on delete cascade
        on update restrict
);

create table IF NOT EXISTS files
(
    file_id text primary key,
    time    timestamp without time zone,
    name    text
);

CREATE INDEX IF NOT EXISTS file_name_idx ON files (name);

create table IF NOT EXISTS stress_report
(
    report_id     text primary key,
    name          text,
    config        jsonb,
    cases         jsonb,
    creation_time timestamp without time zone
);

create table if not exists universe_configs
(
    universe_config_id text primary key,
    source             text,
    name               text
);

create table if not exists stress_results
(
    result_id text primary key,
    data      jsonb,
    type      text,
    name      text,
    test_id   text,

    constraint fk_test_id foreign key (test_id)
        references stress_tests (test_id)
            match full
        on delete cascade
        on update restrict
);

update stress_tests set config = jsonb_set(config, '{test_1}', '"test value"') where test_id = '223c6e6c-922e-4d6a-98c3-72b9fe7c6b1f';

select *
from stress_tests where test_id = '223c6e6c-922e-4d6a-98c3-72b9fe7c6b1f';
