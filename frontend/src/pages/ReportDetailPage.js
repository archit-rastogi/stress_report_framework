import {useParams} from 'react-router-dom';
import React, {Fragment, useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import Test from '../components/test/Test';
import Container from '../components/UI/Container';

const ReportDetailPage = (props) => {
    const params = useParams();
    const {isLoading, error, sendRequest} = useHttp();
    const [tests, setTests] = useState([]);

    useEffect(() => {
        sendRequest({
            url: 'get_report_tests',
            body: {
                name: params.name
            }
        }, (res) => {
            if (res.status) {
                setTests(res.tests);
            }
        })
    }, [])

    return (
        <Container>
            {tests.map(test => <Test key={test.test_id} data={test}/>)}
        </Container>
    )
}

export default ReportDetailPage;
