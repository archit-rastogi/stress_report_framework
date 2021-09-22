import {useParams} from 'react-router-dom';
import {Fragment, useEffect, useState} from 'react';
import useHttp from '../hooks/use-http';
import Steps from '../components/steps/Steps';
import Metrics from '../components/metics/Metrics';
import AttachmentsList from '../components/attachments/AttachmentsList';


const TestDetail = (props) => {
    const params = useParams();
    const {isLoading, error, sendRequest} = useHttp()

    const [steps, setSteps] = useState([])
    const [metrics, setMetrics] = useState([])
    const [attachments, setAttachments] = useState([])

    useEffect(() => {
        const prepareMetrics = (res) => {
            setMetrics(res.metrics)
        }
        const prepareSteps = (res) => {
            setSteps(res.steps)
        }
        const prepareAttachments = (res) => {
            setAttachments(res.attachments);
        }
        sendRequest({
            url: `get_metrics?test_id=${params.testId}`,
            method: 'GET',
        }, prepareMetrics)
        sendRequest({
            url: `get_steps?test_id=${params.testId}`,
            method: 'GET',
        }, prepareSteps)
        sendRequest({
            url: `get_attachments?test_id=${params.testId}`,
            method: 'GET',
        }, prepareAttachments)
    }, [])

    return (
        <Fragment>
            {steps.length > 0 ? <Steps steps={steps}/> : null}
            {attachments.length > 0 ? <AttachmentsList attachments={attachments}/> : null}
            {metrics.length > 0 ? <Metrics data={metrics}/> : null}
        </Fragment>
    )
};

export default TestDetail;
