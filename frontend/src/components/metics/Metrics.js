import React, {Fragment} from 'react';
import MetricsGraph from './Graph';

const Metrics = (props) => {
    const graphs = []
    props.data.forEach(sample => {
        const newMetrics = Object.keys(sample.data).filter(metricName => !graphs.includes(metricName));
        if (newMetrics.length > 0) {
            graphs.push(...newMetrics)
        }
    })

    const graphsData = {};
    props.data.forEach((sample) => {
        graphs.forEach(graphName => {
            if (sample.data.hasOwnProperty(graphName)) {
                const sampleData = sample.data[graphName];
                const sampleToAdd = {
                    data: sampleData.data,
                    time: sample.time
                }

                if (!graphsData.hasOwnProperty(graphName)) {
                    graphsData[graphName] = {data: [sampleToAdd], name: sampleData.name, symbol: sampleData.symbol, round: sampleData.round_val}
                } else {
                    graphsData[graphName].data.push(sampleToAdd)
                    graphsData[graphName].data = graphsData[graphName].data.sort((a, b) => a.time - b.time);
                }
            }
        })
    })

    return (
        <Fragment>
            {Object.keys(graphsData).map(graphName => <MetricsGraph key={graphName} data={graphsData[graphName]}/>)}
        </Fragment>
    )
}

export default React.memo(Metrics);
