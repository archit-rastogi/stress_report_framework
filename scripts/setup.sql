create table stress_tests_runs
(
    run_id     text primary key,
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
    run_id     text,

    constraint fk_run_id foreign key (run_id)
        references stress_tests_runs (run_id)
            match full
        on delete cascade
        on update restrict
);

select *
from stress_tests_runs;
create table metrics
(
    metric_id text primary key,
    time      timestamp,
    data      jsonb,
    run_id    text,
    constraint fk_run_id foreign key (run_id)
        references stress_tests_runs (run_id)
            match full
        on delete cascade
        on update restrict
);

CREATE INDEX stress_idx ON stress_tests_runs(start_time ASC, end_time ASC);
