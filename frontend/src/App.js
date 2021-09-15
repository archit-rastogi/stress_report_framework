import RunsListPage from './pages/Runs';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Fragment} from 'react';
import RunDetail from './pages/RunDetail';

function App() {
    return (
        <Fragment>
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/runs"/>
                </Route>
                <Route path="/runs" exact>
                    <RunsListPage/>
                </Route>
                <Route path="/runs/:runId" exact>
                    <RunDetail/>
                </Route>
            </Switch>
        </Fragment>
    );
}

export default App;
