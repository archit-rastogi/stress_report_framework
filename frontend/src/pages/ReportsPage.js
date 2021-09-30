import useHttp from '../hooks/use-http';
import React, {useEffect, useState} from 'react';
import Container from '../components/UI/Container';
import ReportItem from '../components/report/ReportItem';


const ReportsPage = (props) => {
    const {isLoading, error, sendRequest} = useHttp();
    const [reports, setReports] = useState([])

    useEffect(() => {
        sendRequest({
            url: 'get_reports',
            method: 'GET'
        }, (res) => {
            if (res.status) {
                setReports(res.reports);
            }
        });
    }, []);

    return (
        <Container>
            {reports.map(report => <ReportItem key={report.report_id} reportData={report}/>)}
        </Container>
    )
}

export default ReportsPage;
