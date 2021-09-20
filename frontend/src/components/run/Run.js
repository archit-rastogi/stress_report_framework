import {Card, CardActionArea, CardContent, Divider, Grid, LinearProgress, Typography} from '@material-ui/core';
import {Fragment} from 'react';
import moment from 'moment/moment';
import {useHistory, useRouteMatch} from 'react-router-dom';
import css from './Run.module.css'


const Run = (props) => {
    const match = useRouteMatch();
    const history = useHistory();

    const formatTime = (ts) => {
        if (ts === null) {
            return ''
        }
        return moment(ts * 1000).format('DD.MM HH:mm:ss')
    }

    const cardColor = props.data.status === 'passed' ? 'rgba(12,225,5,0.05)' : props.data.status === 'failed' ? 'rgba(225,5,5,0.05)' : null
    const statusColor = props.data.status === 'passed' ? 'rgba(11,164,1,0.5)' : props.data.status === 'failed' ? 'rgba(168,0,0,0.5)' : 'rgba(190,115,1,0.5)'

    const clickHandler = () => {
        history.push(`${match.url}/${props.data.run_id}`);
    }

    return (
        <Fragment>
            <Card className={css.root} onClick={clickHandler} style={{backgroundColor: cardColor}}>
                <CardActionArea>
                    <Grid container>
                        <Grid item xs={3}>
                            <CardContent>
                                <Typography gutterBottom variant="body1" component="h5">
                                    {props.data.run_id}
                                </Typography>
                            </CardContent>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography gutterBottom variant="body1" component="div">
                                {Object.keys(props.data.config).map(k => <div key={k}>{k}: {props.data.config[k]}</div>)}
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
            </Card>
            {props.data.status === 'running' && <LinearProgress style={{width: '100%'}}/>}
        </Fragment>
    )
}

export default Run;
