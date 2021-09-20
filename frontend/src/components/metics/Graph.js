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

    const format = (timestamp) => moment(timestamp).format('DD.MM HH:mm:ss');
    const timeFormat = (data) => format(data)
    const avg = (items) => {
        return items.reduce((prev, next) => prev + next) / items.length
    }

    const setOption = (type) => {
        const series = []
        const legends = []
        const subGraphs = {}
        Object.keys(props.data.data).forEach(subGraphKey => {
            const subGraphData = props.data.data[subGraphKey];
            Object.keys(subGraphData.data).forEach(subGraphName => {
                const separatedData = subGraphData.data[subGraphName];
                if (subGraphs.hasOwnProperty(subGraphName)) {
                    subGraphs[subGraphName] = subGraphs[subGraphName].concat([{time: subGraphData.time, data: separatedData}])
                } else {
                    subGraphs[subGraphName] = [{time: subGraphData.time, data: separatedData}]
                }
            })
        })
        if (type === 'avg') {
            const roundV = 10 ** props.data.round;
            Object.keys(subGraphs).forEach(subGraphName => {
                const subGraphData = subGraphs[subGraphName];
                const seriesName = `${subGraphName} avg`
                series.push({
                    type: 'line',
                    name: seriesName,
                    data: subGraphData
                        .filter(pointData => Object.keys(pointData.data).length > 0)
                        .map(pointData =>
                            [pointData.time * 1000, Math.round(avg(Object.values(pointData.data)) * roundV) / roundV]
                        )
                })
                legends.push(seriesName)
            });
        } else if (type === 'separated') {
            Object.keys(subGraphs).forEach(subGraphName => {
                const subGraphData = subGraphs[subGraphName];
                const hostsData = {}
                subGraphData.forEach(point => {
                    Object.keys(point.data).forEach(host => {
                        const d = [Math.round(point.time) * 1000, point.data[host]]
                        if (hostsData.hasOwnProperty(host)) {
                            hostsData[host] = hostsData[host].concat([d])
                        } else {
                            hostsData[host] = [[d]]
                        }
                    })
                });
                Object.keys(hostsData).forEach(host => {
                    const seriesName = `${subGraphName} ${host}`;
                    series.push({
                        type: 'line',
                        name: seriesName,
                        data: hostsData[host]
                    });
                    legends.push(seriesName);
                })
            });
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
            emphasis: {
                focus: 'series'
            },
            xAxis: [{
                type: 'time',
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
