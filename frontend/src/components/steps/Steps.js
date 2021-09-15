import React, {Fragment, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import moment from 'moment/moment';
import StepProperties from './StepProperties';
import {Button} from '@material-ui/core';

const Steps = (props) => {
    const format = (timestamp) => moment(timestamp * 1000).format('DD.MM HH:mm:ss');
    const stepsGroups = props.steps.reduce((prev, next) => {
        if (!prev.hasOwnProperty('status')) {
            if (Object.keys(prev).includes(next.properties.name)) {
                prev[next.properties.name].push(next)
                prev[next.properties.name] = prev[next.properties.name].sort((a, b) => a.start_time - b.start_time)
            } else {
                prev[next.properties.name] = [next]
            }
        } else {
            const res = {}
            res[next.properties.name] = [next]
            res[prev.properties.name] = [prev]
            return res
        }
        return prev
    });

    const minTime = Math.min(...props.steps.map(step => step.start_time))
    let maxTime = Math.max(...props.steps.map(step => step.end_time))
    if (maxTime === 0) {
        maxTime = minTime + 60 * 5
    }
    const stepsNames = Object.keys(stepsGroups).sort((a, b) => stepsGroups[b][0].start_time - stepsGroups[a][0].start_time)
    const stepLastTime = {}
    const series = []
    const steps = []
    stepsNames.forEach((stepKey, skIdx) => {
        stepsGroups[stepKey].forEach((step, sIdx) => {
            steps.push(step);
            if (step.status === 'running') {
                step.end_time = maxTime;
            }
            const stepName = step.properties.name;
            if (!stepLastTime.hasOwnProperty(stepName)) {
                stepLastTime[stepName] = {
                    diff: step.start_time - minTime,
                    point: step.start_time
                };
            } else {
                stepLastTime[stepName] = {
                    diff: step.start_time - stepLastTime[stepName].point,
                    point: step.start_time
                };
            }
            series.push({
                name: 'test',
                type: 'bar',
                stack: 'test',
                emphasis: {
                    itemStyle: {
                        borderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    }
                },
                itemStyle: {
                    borderColor: 'rgba(0,0,0,0)',
                    color: 'rgba(0,0,0,0)'
                },
                data: [...Array(skIdx).keys()].map(_ => '-')
                    .concat([stepLastTime[stepName].diff])
                    .concat([...Array(stepsNames.length - skIdx - 1).keys()].map(_ => '-'))
            })


            stepLastTime[stepName] = {
                diff: step.end_time - stepLastTime[stepName].point,
                point: step.end_time
            };
            series.push({
                name: stepName,
                type: 'bar',
                stack: 'test',
                itemStyle: {
                    color: step.status === 'passed' ? 'rgba(1,215,19,0.4)' : step.status === 'failed' ? 'rgba(215,1,1,0.4)' : 'rgba(241,186,4,0.53)'
                },
                data: [...Array(skIdx).keys()].map(_ => '-')
                    .concat([stepLastTime[stepName].diff])
                    .concat([...Array(stepsNames.length - skIdx - 1).keys()].map(_ => '-'))
            })
        })
    })
    const formatCursor = (params) => {
        const foundParam = params.find(param => param.value !== '-' && param.seriesName !== 'test');
        if (!foundParam) {
            return '';
        }
        const dates = stepsGroups[foundParam.seriesName].map(step => {
            return `${format(step.start_time)} - ${format(step.end_time)}`
        }).join('<br/>')
        return `${foundParam.seriesName}<br/>${dates}`;
    }
    const timeFormat = (data) => {
        return format(minTime + data);
    }
    const option = {
        title: {
            text: ''
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: timeFormat
            }
        },
        dataZoom: [
            {
                show: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        yAxis: {
            type: 'category',
            data: stepsNames
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: formatCursor
        },
        grid: {
            containLabel: true,
        },
        series
    }


    const click = (e) => {
        const stepName = e.seriesName;
        let newSteps;
        if (openedSteps.includes(stepName)) {
            newSteps = openedSteps.filter(sn => sn !== stepName)
        } else {
            newSteps = [...openedSteps].concat([stepName])
        }
        newSteps = newSteps.sort((a, b) => a.localeCompare(b));
        setOpenedSteps(newSteps);
    }
    const [openedSteps, setOpenedSteps] = useState([]);
    console.log(openedSteps, steps);
    const openedStepsData = steps.filter(step => openedSteps.includes(step.properties.name));
    const onCloseAllOpenedSteps = () => {
        setOpenedSteps([])
    }
    return (
        <Fragment>
            <ReactECharts onEvents={{'click': click}}
                          style={{height: '50vh'}}
                          option={option}/>
            {openedStepsData.length > 0 && <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Button onClick={onCloseAllOpenedSteps}>Close all</Button>
            </div>}
            {openedStepsData.map(step => <StepProperties key={step.step_id} step={step}/>)}
        </Fragment>
    )
}


export default React.memo(Steps);
