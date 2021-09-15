import {useParams} from 'react-router-dom';
import {Fragment, useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import Steps from '../components/steps/Steps';
import Metrics from '../components/metics/Metrics';


const RunDetail = (props) => {
    const params = useParams();
    const {isLoading, error, sendRequest} = useHttp()

    const [steps, setSteps] = useState([])
    const [metrics, setMetrics] = useState([])


    useEffect(() => {
        const prepareMetrics = (res) => {
            console.log('metrics', res)
            setMetrics(res.metrics)
        }
        const prepareSteps = (res) => {
            console.log('steps', res)
            setSteps(res.steps)
        }
        sendRequest({
            url: `get_metrics?run_id=${params.runId}`,
            method: 'GET',
        }, prepareMetrics)
        sendRequest({
            url: `get_steps?run_id=${params.runId}`,
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

export default RunDetail;
