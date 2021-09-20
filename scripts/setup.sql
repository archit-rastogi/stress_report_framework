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
    time      timestamp,
    data      jsonb,
    test_id   text,
    constraint fk_test_id foreign key (test_id)
        references stress_tests (test_id)
            match full
        on delete cascade
        on update restrict
);

CREATE INDEX stress_idx ON stress_tests (start_time ASC, end_time ASC);

