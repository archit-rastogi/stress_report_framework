import React, {Fragment, useEffect, useState} from 'react';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import moment from 'moment/moment';
import {Button} from '@material-ui/core';
import ReactECharts from 'echarts-for-react';

const MetricsGraph = (props) => {
    const [graphType, setGraphType] = useState('avg');
    const [graphOptions, setGraphOptions] = useState({});
    const [extend, setExtend] = useState(false);

    const onGraphTypeChange = (event, newGraphType) => {
        setGraphType(newGraphType);
        setOption(newGraphType);
    }

    const format = (timestamp) => moment(timestamp * 1000).format('DD.MM HH:mm:ss');
    const timeFormat = (data) => {
        return format(data)
    }
    const avg = (items) => {
        return items.reduce((prev, next) => prev + next) / items.length
    }

    const setOption = (type) => {
        const series = []
        const legends = []
        if (type === 'avg') {
            legends.push('avg');
            const roundV = 10 ** props.data.round;
            series.push({
                type: 'line',
                name: 'avg',
                data: props.data.data.map(sample => [sample.time, Math.round(avg(Object.values(sample.data)) * roundV) / roundV])
            })
        } else if (type === 'separated') {
            const graphs = [];
            props.data.data.forEach((sample) => {
                Object.keys(sample.data).forEach(graphName => {
                    if (!graphs.includes(graphName)) {
                        graphs.push(graphName);
                    }
                })
            })
            graphs.forEach(graphName => {
                legends.push(graphName);
                const data = props.data.data.filter(sample => sample.data[graphName]).map(sample => [sample.time, sample.data[graphName]]);
                series.push({
                    type: 'line',
                    name: graphName,
                    data
                })
            })
        }
        setGraphOptions({
            animationDuration: 100,
            legend: {
                data: legends,
                bottom: 0
            },
            tooltip: {
                order: 'valueDesc',
                trigger: 'axis'
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {},
                },
                z: 0
            },
            xAxis: [{
                name: 'time',
                type: 'category',
                axisLabel: {
                    formatter: timeFormat
                }
            }],
            yAxis: [{
                name: props.data.symbol,
                type: 'value'
            }],
            series
        })
    }

    useEffect(() => {
        setOption(graphType)
    }, [])

    const onExtend = () => {
        setExtend(!extend)
    }


    return (
        <Fragment>
            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Button onClick={onExtend} style={{width: '300px', fontWeight: 'bold', marginBottom: '10px'}}>{props.data.name}</Button>
            </div>
            {extend && <Fragment>
                <div style={{textAlign: 'center', width: '100%'}}>
                    <ToggleButtonGroup
                        value={graphType}
                        exclusive
                        onChange={onGraphTypeChange}
                    >
                        <ToggleButton value="avg">
                            Avg
                        </ToggleButton>
                        <ToggleButton value="separated">
                            Separated
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <ReactECharts
                    notMerge={true}
                    lazyUpdate={false}
                    style={{width: '100%'}}
                    option={graphOptions}/>
            </Fragment>}
        </Fragment>
    )
}

export default MetricsGraph;
