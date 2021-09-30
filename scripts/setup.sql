create table stress_tests
(
    test_id    text primary key,
    config     jsonb,
    start_time timestamp without time zone,
    end_time   timestamp without time zone,
    status     text
);

create table steps
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

create table metrics
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

CREATE INDEX stress_idx ON stress_tests (start_time ASC, end_time ASC);

create table attachments
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

create table files
(
    file_id text primary key,
    time    timestamp without time zone,
    name    text
);

CREATE INDEX file_name_idx ON files (name);

create table stress_report
(
    report_id     text primary key,
    name          text,
    config        jsonb,
    cases         jsonb,
    creation_time timestamp without time zone
);
