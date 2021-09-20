import 'date-fns';
import Layout from '../components/UI/Layout';
import {useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import Run from '../components/run/Run';
import {Button, LinearProgress, List, TextField} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import {useHistory, useLocation, useRouteMatch} from 'react-router-dom';
import moment from 'moment/moment';


const RunsListPage = (props) => {
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    let initialDate = new Date();
    if (queryParams.has('time')) {
        initialDate = new Date(queryParams.get('time'));
    }
    const [selectedDate, setSelectedDate] = useState(initialDate)
    const [runs, setRuns] = useState([])
    const [showRuns, setShowRuns] = useState([])
    const {isLoading, error, sendRequest} = useHttp()

    useEffect(() => {
        const prepareData = (res) => {
            if (res.hasOwnProperty('runs')) {
                const newRuns = res.runs.map(run => {
                    run.start_time_pretty = moment(run.start_time * 1000).format('DD.MM HH:mm:ss')
                    run.end_time_pretty = moment(run.end_time * 1000).format('DD.MM HH:mm:ss')
                    return run;
                })
                setRuns(res.runs)
                setShowRuns(res.runs)
            }
        }
        sendRequest({
            url: 'get_runs',
            body: {
                date: selectedDate.getTime() / 1000
            }
        }, prepareData)
    }, [sendRequest, selectedDate])

    const goDate = (date) => {
        const year = `${date.getFullYear()}`.substr(-2)
        const param = encodeURI(`${date.getMonth() + 1}/${date.getDate()}/${year}`);
        setSelectedDate(date);
        history.push(`${match.url}?time=${param}`);
    }

    const onDateChange = (date) => {
        goDate(date)
    }

    const onPrevious = () => {
        goDate(moment(selectedDate).add(-1, 'days').toDate())
    }

    const onNext = () => {
        goDate(moment(selectedDate).add(1, 'days').toDate())
    }

    const onFilterInput = (event) => {
        const value = event.target.value;
        setShowRuns(runs.filter(run =>
            run.run_id.includes(value)
            || run.status.includes(value)
            || run.start_time_pretty.includes(value)
            || run.end_time_pretty.includes(value)
            || Object.values(run.config).find(v => v.toString().includes(value))
        ));
    }

    return (
        <Layout>
            {isLoading && <LinearProgress style={{width: '100%'}}/>}
            <div style={{display: 'flex'}}>
                <Button onClick={onPrevious}>{'<'}</Button>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        disableToolbar
                        autoOk={true}
                        variant="inline"
                        format="MM/dd/yy"
                        margin="normal"
                        id="date-picker-inline"
                        value={selectedDate}
                        onChange={onDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
                <Button onClick={onNext}>{'>'}</Button>
            </div>
            <TextField onChange={onFilterInput} style={{width: '400px'}}/>
            <List>
                {showRuns.map(run => <Run data={run} key={run.run_id}/>)}
            </List>
        </Layout>
    )
}

export default RunsListPage
