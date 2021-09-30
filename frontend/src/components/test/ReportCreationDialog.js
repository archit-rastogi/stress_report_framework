import {Button, Dialog, TextField} from '@material-ui/core';
import {useRef} from 'react';
import useHttp from '../../hooks/use-http';

const ReportCreationDialog = (props) => {
    const nameRef = useRef();
    const {isLoading, error, sendRequest} = useHttp();

    const createReport = (event) => {
        event.preventDefault();
        const name = nameRef.current.value;

        const prepareReportsList = (res) => {
            if (res.status) {
                props.onCloseReportCreation();
            }
        }

        sendRequest({
            url: `add_report`,
            method: 'POST',
            body: {name}
        }, prepareReportsList)
    }

    return (
        <Dialog open={props.openReportCreation} onClose={props.onCloseReportCreation} fullWidth={true} maxWidth={'sm'}>
            <form style={{margin: '30px'}} onSubmit={createReport}>
                <TextField fullWidth={true} label={'Name'} inputRef={nameRef}/>
                <Button style={{marginTop: '30px'}} fullWidth={true} type={'submit'}>Create</Button>
            </form>
        </Dialog>
    )
}

export default ReportCreationDialog;
