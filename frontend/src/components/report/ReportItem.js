import {Card, CardActionArea, CardContent, Grid, Typography} from '@material-ui/core';
import React from 'react';
import moment from 'moment/moment';
import {useHistory, useRouteMatch} from 'react-router-dom';


const ReportItem = (props) => {
    const format = (ts) => moment(ts * 1000).format('DD.MM HH:mm:ss')
    const history = useHistory();
    const match = useRouteMatch();


    const onSelectCase = () => {
        history.push(`${match.url}/${props.reportData.name}`)
    }

    return (
        <Card>
            <CardActionArea style={{width: '100%'}} onClick={onSelectCase}>
                <CardContent>
                    <Grid container>
                        <Grid item xs={3}>
                            <Typography variant="body1" component="h5">
                                {props.reportData.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="body1" component="h5">
                                {format(props.reportData.creation_time)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default ReportItem;
