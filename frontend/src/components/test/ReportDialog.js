import {Dialog, Divider, List, ListItem, ListItemText} from '@material-ui/core';
import React, {Fragment, useEffect, useState} from 'react';
import useHttp from '../../hooks/use-http';
import ReportCreationDialog from './ReportCreationDialog';

const ReportDialog = (props) => {
    const [openCreationDialog, setOpenCreationDialog] = useState(false);
    const {isLoading, error, sendRequest} = useHttp();
    const [reportsList, setReportsList] = useState([]);

    const getReports = () => {
        sendRequest({
            url: `get_reports`,
            method: 'GET',
        }, (res) => setReportsList(res.reports))
    }

    useEffect(() => {
        if (props.openDialog && reportsList.length === 0) {
            getReports()
        }
    }, [props.openDialog])

    const onCloseReportCreation = () => {
        setOpenCreationDialog(false);
        getReports();
    }

    const onReportSelect = (reportId) => {
        sendRequest({
            url: 'add_report_case',
            method: 'POST',
            body: {
                case_id: props.testId,
                report_id: reportId
            }
        }, (res) => {
            if (res.status) {
                props.onCloseDialog();
            }
        })
    }

    return (
        <Fragment>
            <Dialog fullWidth={true} maxWidth={'sm'} open={props.openDialog} onClose={props.onCloseDialog}>
                <List>
                    <ListItem style={{marginBottom: '20px', backgroundColor: 'rgba(0,111,255,0.15)'}} button onClick={() => setOpenCreationDialog(true)}>
                        <ListItemText primary="Create report"/>
                    </ListItem>
                    {reportsList.map(report => <ListItem button onClick={() => onReportSelect(report.report_id)} key={report.name}>
                        <ListItemText primary={report.name}/>
                    </ListItem>)}
                </List>
            </Dialog>
            <ReportCreationDialog
                openReportCreation={openCreationDialog}
                onCloseReportCreation={onCloseReportCreation}/>
        </Fragment>
    )
}

export default ReportDialog;
