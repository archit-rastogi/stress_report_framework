import {useParams} from 'react-router-dom';
import {Fragment, useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import Steps from '../components/steps/Steps';
import Metrics from '../components/metics/Metrics';


const TestDetail = (props) => {
    const params = useParams();
    const {isLoading, error, sendRequest} = useHttp()

    const [steps, setSteps] = useState([])
    const [metrics, setMetrics] = useState([])


    useEffect(() => {
        const prepareMetrics = (res) => {
            setMetrics(res.metrics)
        }
        const prepareSteps = (res) => {
            setSteps(res.steps)
        }
        sendRequest({
            url: `get_metrics?test_id=${params.testId}`,
            method: 'GET',
        }, prepareMetrics)
        sendRequest({
            url: `get_steps?test_id=${params.testId}`,
            method: 'GET',
        }, prepareSteps)
    }, [])

    return (
        <Fragment>
            {steps.length > 0 ? <Steps steps={steps}/> : null}
            {metrics.length > 0 ? <Metrics data={metrics}/> : null}
        </Fragment>
    )
};

export default TestDetail;
