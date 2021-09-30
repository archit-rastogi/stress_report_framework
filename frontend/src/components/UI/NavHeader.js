import css from './NavHeader.module.css'
import {Fragment} from 'react';
import {Button} from '@material-ui/core';
import {useHistory} from 'react-router-dom';

const buttonStyle = {
    textTransform: 'none',
    justifyContent: 'flex-start'
}

const NavHeader = (props) => {
    const history = useHistory();

    return (
        <Fragment>
            <header className={css.header}>
                <div style={{width: '10%'}}></div>
                <Button style={buttonStyle} onClick={() => history.push('/tests')}>
                    Tests
                </Button>
                <Button style={buttonStyle} onClick={() => history.push('/reports')}>
                    Reports
                </Button>
            </header>
            {props.children}
        </Fragment>
    )
}

export default NavHeader;
