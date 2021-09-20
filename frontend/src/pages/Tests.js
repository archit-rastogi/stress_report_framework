import 'date-fns';
import Layout from '../components/UI/Layout';
import {useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import {Button, LinearProgress, List, TextField} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import {useHistory, useLocation, useRouteMatch} from 'react-router-dom';
import moment from 'moment/moment';
import Test from '../components/test/Test';


const TestsListPage = (props) => {
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    let initialDate = new Date();
    if (queryParams.has('time')) {
        initialDate = new Date(queryParams.get('time'));
    }
    const [selectedDate, setSelectedDate] = useState(initialDate)
    const [tests, setTests] = useState([])
    const [showTests, setShowTests] = useState([])
    const {isLoading, error, sendRequest} = useHttp()

    useEffect(() => {
        const prepareData = (res) => {
            if (res.hasOwnProperty('tests')) {
                const newTests = res.tests.map(test => {
                    test.start_time_pretty = moment(test.start_time * 1000).format('DD.MM HH:mm:ss')
                    test.end_time_pretty = moment(test.end_time * 1000).format('DD.MM HH:mm:ss')
                    return test;
                })
                setTests(newTests);
                setShowTests(newTests)
            }
        }
        sendRequest({
            url: 'get_tests',
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
        setShowTests(tests.filter(test =>
            test.test_id.includes(value)
            || test.status.includes(value)
            || test.start_time_pretty.includes(value)
            || test.end_time_pretty.includes(value)
            || Object.values(test.config).find(v => v.toString().includes(value))
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
                {showTests.map(test => <Test data={test} key={test.test_id}/>)}
            </List>
        </Layout>
    )
}

export default TestsListPage
