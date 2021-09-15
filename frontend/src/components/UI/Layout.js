import css from './Layout.module.css';

const Container = (props) => {
    return (
        <div className={css.container}>
            {props.children}
        </div>
    )
}

export default Container;
