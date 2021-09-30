import {Button, Card, CardActionArea, CardActions, CardContent, Dialog, Grid, List, ListItem, ListItemText, Typography} from '@material-ui/core';
import React, {Fragment, useState} from 'react';
import moment from 'moment/moment';
import {useHistory, useRouteMatch} from 'react-router-dom';
import css from './Test.module.css'
import ReportDialog from './ReportDialog';


const Test = (props) => {
    const history = useHistory();
    const [openDialog, setOpenDialog] = useState(false);
    const [reports, setReports] = useState([]);

    const formatTime = (ts) => {
        if (ts === null) {
            return ''
        }
        return moment(ts * 1000).format('DD.MM HH:mm:ss')
    }

    const cardColor = props.data.status === 'passed' ? 'rgba(12,225,5,0.05)' : props.data.status === 'failed' ? 'rgba(225,5,5,0.05)' : null
    const statusColor = props.data.status === 'passed' ? 'rgba(11,164,1,0.5)' : props.data.status === 'failed' ? 'rgba(168,0,0,0.5)' : 'rgba(190,115,1,0.5)'

    const clickHandler = () => {
        history.push(`/tests/${props.data.test_id}`);
    }

    return (
        <Fragment>
            <Card style={{backgroundColor: cardColor}}>
                <CardActionArea style={{width: '100%'}} onClick={clickHandler}>
                    <Grid container>
                        <Grid item xs={9}>
                            <Typography style={{padding: '10px'}} gutterBottom variant="body1" component="div">
                                {Object.keys(props.data.config).map(k => <div key={k}>{k}: {props.data.config[k]}</div>).splice(0, 10)}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography className={css.right} variant="body1" component="div">
                                <div>
                                    {`${formatTime(props.data.start_time)} - ${formatTime(props.data.end_time)}`}
                                </div>
                                <div style={{fontWeight: 'bold', fontSize: 'x-large', color: statusColor}}>
                                    {props.data.status}
                                </div>
                            </Typography>
                        </Grid>
                    </Grid>
                </CardActionArea>
                <CardActions style={{display: 'flex', justifyContent: 'right'}}>
                    {props.showReportAction && <Button onClick={() => setOpenDialog(true)} size="small" color="primary">
                        Add to report
                    </Button>}
                </CardActions>
            </Card>
            <ReportDialog openDialog={openDialog} testId={props.data.test_id} onCloseDialog={() => setOpenDialog(false)}/>
        </Fragment>
    )
}

export default Test;
