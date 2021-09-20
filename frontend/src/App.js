import {Redirect, Route, Switch} from 'react-router-dom';
import {Fragment} from 'react';
import TestsListPage from './pages/Tests';
import TestDetail from './pages/TestDetail';

function App() {
    return (
        <Fragment>
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/tests"/>
                </Route>
                <Route path="/tests" exact>
                    <TestsListPage/>
                </Route>
                <Route path="/tests/:testId" exact>
                    <TestDetail/>
                </Route>
            </Switch>
        </Fragment>
    );
}

export default App;
