import css from './StepProperties.module.css'
import moment from 'moment/moment';

const StepProperties = (props) => {
    const format = (timestamp) => moment(timestamp * 1000).format('DD.MM HH:mm:ss');
    return (
        <div className={css.div}>
            <h3>{props.step.properties.name}</h3>
            <h4>{`${format(props.step.start_time)} - ${format(props.step.end_time)}`}</h4>
            <table className={css.table}>
                <tbody>
                {Object.keys(props.step.properties).map(key =>
                    <tr key={key} className={css.row}>
                        <td className={css.td}>{key}</td>
                        <td className={css.td}>{props.step.properties[key]}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    )
}

export default StepProperties;
